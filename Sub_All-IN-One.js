/**
 * Sub-Store 精准聚合脚本
 * 功能：强制唯一标签，合并去重
 * 作者：Patatooo TG@Hankin_He
 */

function mergeLoonPlugins(files) {
    const sections = {
        Rule: [],
        Rewrite: [],
        Script: [],
        MitM: new Set()
    };

    // 遍历 Sub-Store 传入的所有来源文本
    files.forEach(text => {
        if (typeof text !== 'string' || !text) return;

        let currentSection = null;
        let pluginName = "未知插件";
        
        // 提前抓取该订阅自带的插件名称，方便后续做注释标记
        const nameMatch = text.match(/^#!name=(.*)/m);
        if (nameMatch && nameMatch[1]) {
            pluginName = nameMatch[1].trim();
        }

        const lines = text.split(/\r?\n/);
        // 用于记录该插件在当前分类下是否已经打过注释
        let hasAddedComment = { Rule: false, Rewrite: false, Script: false };

        for (let line of lines) {
            let trimmed = line.trim();
            
            // 忽略空行和每个文件的独立元数据标头 (#!开头)
            if (!trimmed || trimmed.startsWith("#!")) continue;

            // 识别标签，并将后续规则塞入对应的数组
            if (/^\[Rule\]/i.test(trimmed)) { currentSection = "Rule"; continue; }
            if (/^\[Rewrite\]/i.test(trimmed)) { currentSection = "Rewrite"; continue; }
            if (/^\[Script\]/i.test(trimmed)) { currentSection = "Script"; continue; }
            if (/^\[MitM\]/i.test(trimmed)) { currentSection = "MitM"; continue; }
            
            // 遇到不支持的标签（如 [URL Rewrite]），暂时挂起
            if (/^\[.*\]/.test(trimmed)) { currentSection = null; continue; } 

            // 处理 MitM 域名的提取与绝对去重
            if (currentSection === "MitM") {
                if (/^hostname?\s*=/i.test(trimmed)) {
                    const rawHosts = trimmed.substring(trimmed.indexOf('=') + 1);
                    rawHosts.split(",").forEach(h => {
                        if (h.trim()) sections.MitM.add(h.trim());
                    });
                }
            } 
            // 收集具体的规则内容
            else if (currentSection) {
                // 首次写入该插件的该类规则时，加一个空行和注释标头
                if (!hasAddedComment[currentSection]) {
                    sections[currentSection].push(`\n# > ${pluginName}`);
                    hasAddedComment[currentSection] = true;
                }
                sections[currentSection].push(line);
            }
        }
    });

    // 开始严格按“唯一标签”格式组装最终代码
    let output = [];
    output.push("#!name=聚合去广告大师");
    output.push("#!desc=由 Sub-Store 自动提取合并，极大提升 Egern 加载速度");
    output.push("#!author=Patatooo｜TG@Hankin_He");                              
    output.push("#!icon=https://github.com/3183339668/Egern/raw/refs/heads/main/IMG_7064.jpeg");
    output.push("");

    if (sections.Rule.length > 0) {
        output.push("[Rule]");
        output.push(sections.Rule.join("\n").replace(/^\n/, ""));
        output.push("");
    }

    if (sections.Rewrite.length > 0) {
        output.push("[Rewrite]");
        output.push(sections.Rewrite.join("\n").replace(/^\n/, ""));
        output.push("");
    }

    if (sections.Script.length > 0) {
        output.push("[Script]");
        output.push(sections.Script.join("\n").replace(/^\n/, ""));
        output.push("");
    }

    if (sections.MitM.size > 0) {
        output.push("[MitM]");
        output.push(`hostname = ${Array.from(sections.MitM).join(", ")}`);
        output.push("");
    }

    return output.join("\n");
}

// 获取 Sub-Store 所有的来源文本
const contents = typeof $files !== 'undefined' ? $files : (typeof $content !== 'undefined' ? [$content] : []);

// 执行并覆盖全局产出
$content = mergeLoonPlugins(contents);
