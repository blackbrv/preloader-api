import { promises as fs } from "fs";
import path from "path";

const FILE_PATH = path.join(process.cwd(), "preloaders.json");

export async function GET() {
  const file = await fs.readFile(FILE_PATH, "utf-8");
  return new Response(file, { status: 200 });
}

export async function POST(req: Request) {
  const newData = await req.json();
  const file = await fs.readFile(FILE_PATH, "utf-8");
  const data = JSON.parse(file);

  data.push(newData);
  await fs.writeFile(FILE_PATH, JSON.stringify(data, null, 2));
  return new Response(JSON.stringify({ message: "Created" }), { status: 201 });
}

export async function PUT(req: Request) {
  const updated = await req.json(); // expects: { value: "spinners", data: {...} }

  const file = await fs.readFile(FILE_PATH, "utf-8");
  let data = JSON.parse(file);

  data = data.map((item: any) =>
    item.value === updated.value ? { ...item, ...updated.data } : item
  );

  await fs.writeFile(FILE_PATH, JSON.stringify(data, null, 2));
  return new Response(JSON.stringify({ message: "Updated" }), { status: 200 });
}

export async function DELETE(req: Request) {
  const { value } = await req.json(); // expects: { value: "spinners" }

  const file = await fs.readFile(FILE_PATH, "utf-8");
  let data = JSON.parse(file);

  data = data.filter((item: any) => item.value !== value);

  await fs.writeFile(FILE_PATH, JSON.stringify(data, null, 2));
  return new Response(JSON.stringify({ message: "Deleted" }), { status: 200 });
}
