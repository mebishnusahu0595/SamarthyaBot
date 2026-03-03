package main

import (
	"bufio"
	"encoding/json"
	"fmt"
	"io"
	"os"
	"os/exec"
	"strings"
	"time"
)

// Request defines the incoming JSON command from Node.js
type Request struct {
	ID        string `json:"id"`
	Command   string `json:"command"`
	Dir       string `json:"dir"`
	Stream    bool   `json:"stream"`    // If true, stream output live
	TimeoutMs int    `json:"timeoutMs"` // 0 for infinite
}

// Response defines the payload sent back to Node.js
type Response struct {
	ID          string `json:"id"`
	Type        string `json:"type"` // "start", "stdout", "stderr", "end", "error"
	Data        string `json:"data"`
	ExitCode    int    `json:"exitCode"`
	ElapsedTime int64  `json:"elapsedTimeMs"`
}

func main() {
	// The Node.js parent process communicates via process.stdin and process.stdout.
	reader := bufio.NewReader(os.Stdin)

	for {
		line, err := reader.ReadString('\n')
		if err != nil {
			if err == io.EOF {
				break
			}
			continue
		}

		line = strings.TrimSpace(line)
		if line == "" {
			continue
		}

		var req Request
		if err := json.Unmarshal([]byte(line), &req); err != nil {
			sendError("", fmt.Sprintf("Failed to parse request: %v", err))
			continue
		}

		// Execute command in a goroutine so the worker can process multiple requests
		go handleCommand(req)
	}
}

func handleCommand(req Request) {
	startTime := time.Now()

	// Notify Node.js that the command has started
	sendResponse(req.ID, "start", fmt.Sprintf("Executing: %s", req.Command), 0, 0)

	// Since we want to pass a raw command string like `npm run dev` or `vercel --prod`,
	// we use a shell to interpret it cleanly. Cross-platform awareness:
	// For Windows, we might use "cmd" "/c". For Unix, "sh" "-c".
	var cmd *exec.Cmd
	if isWindows() {
		cmd = exec.Command("cmd", "/C", req.Command)
	} else {
		cmd = exec.Command("sh", "-c", req.Command)
	}

	if req.Dir != "" {
		cmd.Dir = req.Dir
	}

	// Capture stdout and stderr
	stdoutPipe, err := cmd.StdoutPipe()
	if err != nil {
		sendError(req.ID, fmt.Sprintf("Failed to create stdout pipe: %v", err))
		return
	}
	stderrPipe, err := cmd.StderrPipe()
	if err != nil {
		sendError(req.ID, fmt.Sprintf("Failed to create stderr pipe: %v", err))
		return
	}

	if err := cmd.Start(); err != nil {
		sendError(req.ID, fmt.Sprintf("Failed to start command: %v", err))
		return
	}

	// Start streamers
	go streamToNode(req.ID, "stdout", stdoutPipe, req.Stream)
	go streamToNode(req.ID, "stderr", stderrPipe, req.Stream)

	// In the future for a production app, we would add the timeout context here.
	err = cmd.Wait()
	elapsed := time.Since(startTime).Milliseconds()

	exitCode := 0
	if err != nil {
		if exitError, ok := err.(*exec.ExitError); ok {
			exitCode = exitError.ExitCode()
		} else {
			exitCode = 1
		}
	}

	sendResponse(req.ID, "end", "Command completed.", exitCode, elapsed)
}

func streamToNode(reqID string, streamType string, pipe io.Reader, allowStream bool) {
	scanner := bufio.NewScanner(pipe)

	// Create a large buffer (bufio.MaxScanTokenSize is usually 64kb)
	buf := make([]byte, 0, 64*1024)
	scanner.Buffer(buf, 1024*1024) // Allow up to 1MB per line/token

	for scanner.Scan() {
		text := scanner.Text()
		if allowStream {
			sendResponse(reqID, streamType, text, -1, 0)
		}
	}
}

func sendResponse(reqID string, resType string, data string, exitCode int, elapsed int64) {
	// Base64 encode or properly escape JSON if necessary in complex outputs,
	// but Go's json.Marshal smoothly handles quotes inside strings.
	res := Response{
		ID:          reqID,
		Type:        resType,
		Data:        data,
		ExitCode:    exitCode,
		ElapsedTime: elapsed,
	}
	encoded, _ := json.Marshal(res)

	// Write to os.Stdout (this is picked up by Node.js).
	// Make sure we end with a newline so Node can parse it line-by-line.
	fmt.Println(string(encoded))
}

func sendError(reqID string, msg string) {
	sendResponse(reqID, "error", msg, -1, 0)
}

func isWindows() bool {
	return os.PathSeparator == '\\'
}
