import { NextRequest, NextResponse } from "next/server";
import { store, flushStore, hydrateStore } from "@/lib/core/store";
import { ISLAND_LOCATIONS } from "@/lib/data/locations";
import { runLlmTask } from "@/lib/llm/router";

// Fallback keyword table for when LLM is unavailable
const FURNITURE_FALLBACK: Record<string, string> = {
  椅子: "🪑", 长椅: "🪑", 凳子: "🪑",
  桌子: "🪵", 桌: "🪵",
  灯笼: "🏮", 灯: "💡", 路灯: "🔦",
  花盆: "🪴", 盆栽: "🪴",
  喷泉: "⛲", 吉他: "🎸", 钢琴: "🎹",
  书架: "📚", 床: "🛏️", 沙发: "🛋️",
  伞: "☂️", 遮阳伞: "☂️",
  木桶: "🪣", 石头: "🪨",
};

function extractLocation(text: string): string | null {
  for (const loc of ISLAND_LOCATIONS) {
    if (text.includes(loc.name)) {
      return loc.name;
    }
  }
  return null;
}

function isRemoveAction(text: string): boolean {
  const removeKeywords = ["移除", "删除", "去掉", "拿走", "撤掉", "拆除", "不要"];
  return removeKeywords.some((kw) => text.includes(kw));
}

type ParsedItem = { name: string; emoji: string };

async function parseFurnitureWithLlm(
  command: string,
  location: string
): Promise<ParsedItem[]> {
  try {
    const result = await runLlmTask({
      taskKey: "decision.light",
      prompt: `用户想在"${location}"布置场景。用户说："${command}"

请提取用户想放置的物品。每个物品用一行输出，格式：
【物品】名称【emoji】合适的emoji符号

规则：
- 如果用户描述了多个物品，每个物品一行
- 物品名称简短（2-4个字）
- emoji选择最贴近的
- 只输出物品行，不要其他文字`,
    });

    const lines = result.text.split("\n").filter((l) => l.includes("【物品】"));
    const items: ParsedItem[] = [];
    for (const line of lines) {
      const nameMatch = line.match(/【物品】\s*(.+?)【emoji】/);
      const emojiMatch = line.match(/【emoji】\s*(.+)/);
      if (nameMatch && emojiMatch) {
        items.push({
          name: nameMatch[1].trim(),
          emoji: emojiMatch[1].trim().slice(0, 2),
        });
      }
    }
    return items;
  } catch {
    return [];
  }
}

function parseFurnitureFallback(text: string): ParsedItem[] {
  const items: ParsedItem[] = [];
  for (const [keyword, emoji] of Object.entries(FURNITURE_FALLBACK)) {
    if (text.includes(keyword)) {
      items.push({ name: keyword, emoji });
    }
  }
  return items;
}

async function parseRemoveTarget(command: string): Promise<string | null> {
  // Try simple keyword match first
  const locationItems = Object.values(store.furniture).flat();
  for (const item of locationItems) {
    if (command.includes(item.name)) return item.name;
  }
  // Try fuzzy: any furniture keyword
  for (const keyword of Object.keys(FURNITURE_FALLBACK)) {
    if (command.includes(keyword)) return keyword;
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    await hydrateStore();
    const body = await request.json();
    const { command } = body;

    if (!command || typeof command !== "string") {
      return NextResponse.json(
        { error: "请提供自然语言指令" },
        { status: 400 }
      );
    }

    const location = extractLocation(command);
    if (!location) {
      return NextResponse.json(
        {
          error:
            "未识别到地点，请说出具体位置（如：广场、海滩、花园、咖啡摊）",
        },
        { status: 400 }
      );
    }

    const isRemove = isRemoveAction(command);

    if (isRemove) {
      const targetName = await parseRemoveTarget(command);
      if (!targetName) {
        return NextResponse.json(
          { error: "未识别到要移除的物品" },
          { status: 400 }
        );
      }

      const locationFurniture = store.furniture[location] || [];
      const index = locationFurniture.findIndex((f) =>
        f.name.includes(targetName) || targetName.includes(f.name)
      );

      if (index === -1) {
        return NextResponse.json(
          { error: `${location}没有"${targetName}"` },
          { status: 400 }
        );
      }

      const removed = locationFurniture.splice(index, 1)[0];
      store.furniture[location] = locationFurniture;
      await flushStore();

      return NextResponse.json({
        success: true,
        message: `已从${location}移除${removed.emoji}${removed.name}`,
        location,
        action: "remove",
        furniture: removed.name,
      });
    }

    // Add items — try LLM first, fallback to keywords
    let items = await parseFurnitureWithLlm(command, location);
    if (items.length === 0) {
      items = parseFurnitureFallback(command);
    }

    if (items.length === 0) {
      return NextResponse.json(
        { error: "未能识别要放置的物品，请试试更具体的描述" },
        { status: 400 }
      );
    }

    if (!store.furniture[location]) {
      store.furniture[location] = [];
    }

    const added: string[] = [];
    for (const item of items) {
      const newFurniture = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        name: item.name,
        emoji: item.emoji,
        addedAt: new Date().toISOString(),
      };
      store.furniture[location].push(newFurniture);
      added.push(`${item.emoji}${item.name}`);
    }

    await flushStore();

    return NextResponse.json({
      success: true,
      message: `已在${location}放置${added.join("、")}`,
      location,
      action: "add",
      itemCount: items.length,
    });
  } catch (error) {
    console.error("Modify API error:", error);
    return NextResponse.json(
      { error: "处理指令时出错" },
      { status: 500 }
    );
  }
}

export async function GET() {
  await hydrateStore();
  return NextResponse.json({
    locations: Object.entries(store.furniture).map(([location, items]) => ({
      location,
      items,
    })),
  });
}
