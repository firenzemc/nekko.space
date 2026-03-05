import { NextRequest, NextResponse } from "next/server";
import { store, flushStore } from "@/lib/core/store";
import { ISLAND_LOCATIONS } from "@/lib/data/locations";

const FURNITURE_KEYWORDS: Record<string, { emoji: string; keywords: string[] }> = {
  "长椅": { emoji: "🪑", keywords: ["长椅", "椅子", "凳子", "椅子"] },
  "桌子": { emoji: "🪵", keywords: ["桌子", "桌", "台"] },
  "灯笼": { emoji: "🏮", keywords: ["灯笼", "灯", "灯饰"] },
  "花盆": { emoji: "🪴", keywords: ["花盆", "盆栽", "植物"] },
  "喷泉": { emoji: "⛲", keywords: ["喷泉", "泉水"] },
  "吉他": { emoji: "🎸", keywords: ["吉他", "乐器", "吉他"] },
  "钢琴": { emoji: "🎹", keywords: ["钢琴", "键盘"] },
  "书架": { emoji: "📚", keywords: ["书架", "书柜", "书"] },
  "床": { emoji: "🛏️", keywords: ["床", "卧室"] },
  "沙发": { emoji: "🛋️", keywords: ["沙发", "沙发"] },
  "地毯": { emoji: "🧶", keywords: ["地毯", "垫子"] },
  "时钟": { emoji: "🕰️", keywords: ["时钟", "钟"] },
  "电视": { emoji: "📺", keywords: ["电视", "电视机"] },
  "冰箱": { emoji: "🧊", keywords: ["冰箱", "冷藏"] },
  "微波炉": { emoji: "🍳", keywords: ["微波炉", "微波"] },
  "洗衣机": { emoji: "🧺", keywords: ["洗衣机", "洗衣"] },
  "壁炉": { emoji: "🔥", keywords: ["壁炉", "火炉"] },
  "圣诞树": { emoji: "🎄", keywords: ["圣诞树", "圣诞"] },
  "南瓜灯": { emoji: "🎃", keywords: ["南瓜灯", "南瓜"] },
  "风车": { emoji: "🌬️", keywords: ["风车"] },
  "木牌": { emoji: "🪧", keywords: ["木牌", "牌子", "标牌"] },
  "伞": { emoji: "☂️", keywords: ["伞", "雨伞"] },
  "船": { emoji: "⛵", keywords: ["船", "小船"] },
  "滑梯": { emoji: "🛝", keywords: ["滑梯"] },
  "跷跷板": { emoji: "🪁", keywords: ["跷跷板"] },
  "荡秋千": { emoji: "🏮", keywords: ["秋千", "荡秋千"] },
};

function extractLocation(text: string): string | null {
  for (const loc of ISLAND_LOCATIONS) {
    if (text.includes(loc.name)) {
      return loc.name;
    }
  }
  return null;
}

function extractFurniture(text: string): { name: string; emoji: string } | null {
  for (const [name, data] of Object.entries(FURNITURE_KEYWORDS)) {
    for (const kw of data.keywords) {
      if (text.includes(kw)) {
        return { name, emoji: data.emoji };
      }
    }
  }
  return null;
}

function isRemoveAction(text: string): boolean {
  const removeKeywords = ["移除", "删除", "去掉", "拿走", "撤掉", "拆除", "不要", "移除"];
  return removeKeywords.some((kw) => text.includes(kw));
}

export async function POST(request: NextRequest) {
  try {
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
        { error: "未识别到地点，请说出具体位置（如：广场、海滩、花园）" },
        { status: 400 }
      );
    }

    const isRemove = isRemoveAction(command);
    const furniture = extractFurniture(command);

    if (isRemove) {
      if (!furniture) {
        return NextResponse.json(
          { error: "未识别到要移除的物品" },
          { status: 400 }
        );
      }

      const locationFurniture = store.furniture[location] || [];
      const index = locationFurniture.findIndex((f) => f.name === furniture.name);

      if (index === -1) {
        return NextResponse.json(
          { error: `${location}没有${furniture.name}` },
          { status: 400 }
        );
      }

      locationFurniture.splice(index, 1);
      store.furniture[location] = locationFurniture;
      await flushStore();

      return NextResponse.json({
        success: true,
        message: `已从${location}移除${furniture.emoji}${furniture.name}`,
        location,
        action: "remove",
        furniture: furniture.name,
      });
    }

    if (!furniture) {
      return NextResponse.json(
        { error: "未识别到要添加的物品（支持的物品：长椅、桌子、灯笼、花盆、喷泉、吉他、钢琴、床、沙发等）" },
        { status: 400 }
      );
    }

    if (!store.furniture[location]) {
      store.furniture[location] = [];
    }

    const exists = store.furniture[location].some((f) => f.name === furniture.name);
    if (exists) {
      return NextResponse.json(
        { error: `${location}已经有${furniture.emoji}${furniture.name}了` },
        { status: 400 }
      );
    }

    const newFurniture = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      name: furniture.name,
      emoji: furniture.emoji,
      addedAt: new Date().toISOString(),
    };

    store.furniture[location].push(newFurniture);
    await flushStore();

    return NextResponse.json({
      success: true,
      message: `已在${location}放置${furniture.emoji}${furniture.name}`,
      location,
      action: "add",
      furniture: newFurniture,
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
  return NextResponse.json({
    locations: Object.entries(store.furniture).map(([location, items]) => ({
      location,
      items,
    })),
  });
}
