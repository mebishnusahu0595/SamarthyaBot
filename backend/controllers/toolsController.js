const toolRegistry = require('../services/tools/toolRegistry');
const { TOOL_PACKS } = require('../config/constants');

// Get all available tools
exports.getTools = async (req, res) => {
    try {
        const tools = toolRegistry.getAllTools().map(t => ({
            name: t.name,
            description: t.description,
            descriptionHi: t.descriptionHi,
            riskLevel: t.riskLevel,
            category: t.category,
            parameters: t.parameters
        }));

        res.json({ success: true, tools });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get tool packs
exports.getToolPacks = async (req, res) => {
    try {
        const packs = Object.entries(TOOL_PACKS).map(([key, pack]) => ({
            id: key,
            name: pack.name,
            nameHi: pack.nameHi,
            description: pack.description,
            toolCount: pack.tools.length,
            tools: pack.tools
        }));

        res.json({ success: true, packs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get tools for a specific pack
exports.getPackTools = async (req, res) => {
    try {
        const { packId } = req.params;
        const tools = toolRegistry.getToolsForPack(packId).map(t => ({
            name: t.name,
            description: t.description,
            descriptionHi: t.descriptionHi,
            riskLevel: t.riskLevel,
            category: t.category
        }));

        res.json({ success: true, tools, pack: TOOL_PACKS[packId] });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
