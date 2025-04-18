import { promises as fs } from "fs";
import path from "path";

const FILE_PATH = path.join(process.cwd(), "data.json");

// Define types to match your template
type PreloaderItem = {
  code: string;
};

type PreloaderCategory = {
  name: string;
  value: string;
  items: PreloaderItem[];
};

// Initialize data.json with your template structure if it doesn't exist
async function initializeData() {
  try {
    await fs.access(FILE_PATH);
  } catch {
    const initialData: PreloaderCategory[] = [
      {
        name: "Spinner",
        value: "spinners",
        items: [
          {
            code: `<div class="spinner"></div>
<style>
.spinner {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    border: 9px solid;
    border-color: #dbdcef;
    border-right-color: #474bff;
    animation: spinner-d3wgkg 1s infinite linear;
}
@keyframes spinner-d3wgkg {
    to {
        transform: rotate(1turn);
    }
}
</style>`,
          },
        ],
      },
    ];
    await fs.writeFile(FILE_PATH, JSON.stringify(initialData, null, 2));
  }
}

// Initialize data on server start
initializeData();

// GET all preloader categories
export async function GET() {
  try {
    const file = await fs.readFile(FILE_PATH, "utf-8");
    return new Response(file, { status: 200 });
  } catch (error) {
    console.error("GET Error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to load preloaders" }),
      {
        status: 500,
      }
    );
  }
}

// Add a new preloader category
export async function POST(req: Request) {
  try {
    const newCategory: PreloaderCategory = await req.json();

    const file = await fs.readFile(FILE_PATH, "utf-8");
    const data: PreloaderCategory[] = JSON.parse(file);

    // Check if category already exists
    if (data.some((cat) => cat.value === newCategory.value)) {
      return new Response(
        JSON.stringify({ error: "Category with this value already exists" }),
        { status: 400 }
      );
    }

    data.push(newCategory);
    await fs.writeFile(FILE_PATH, JSON.stringify(data, null, 2));

    return new Response(
      JSON.stringify({ message: "Category created successfully" }),
      { status: 201 }
    );
  } catch (error) {
    console.error("POST Error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to create category" }),
      { status: 500 }
    );
  }
}

// Add items to an existing category
export async function PUT(req: Request) {
  try {
    const {
      categoryValue,
      items,
    }: { categoryValue: string; items: PreloaderItem[] } = await req.json();

    const file = await fs.readFile(FILE_PATH, "utf-8");
    const data: PreloaderCategory[] = JSON.parse(file);

    const categoryIndex = data.findIndex((cat) => cat.value === categoryValue);
    if (categoryIndex === -1) {
      return new Response(JSON.stringify({ error: "Category not found" }), {
        status: 404,
      });
    }

    // Add new items to the category
    data[categoryIndex].items.push(...items);
    await fs.writeFile(FILE_PATH, JSON.stringify(data, null, 2));

    return new Response(
      JSON.stringify({ message: "Items added successfully" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("PUT Error:", error);
    return new Response(JSON.stringify({ error: "Failed to add items" }), {
      status: 500,
    });
  }
}

// Delete a category
export async function DELETE(req: Request) {
  try {
    const { categoryValue }: { categoryValue: string } = await req.json();

    const file = await fs.readFile(FILE_PATH, "utf-8");
    let data: PreloaderCategory[] = JSON.parse(file);

    data = data.filter((cat) => cat.value !== categoryValue);
    await fs.writeFile(FILE_PATH, JSON.stringify(data, null, 2));

    return new Response(
      JSON.stringify({ message: "Category deleted successfully" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE Error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to delete category" }),
      { status: 500 }
    );
  }
}
