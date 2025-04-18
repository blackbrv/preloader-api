import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Define types (now matching Prisma models)
type PreloaderItem = {
  code: string;
};

type PreloaderCategory = {
  name: string;
  value: string;
  items: PreloaderItem[];
};

// GET all preloader categories
export async function GET() {
  try {
    const categories = await prisma.preloaderCategory.findMany({
      include: { items: true },
    });

    return new Response(JSON.stringify(categories), { status: 200 });
  } catch (error) {
    console.error("GET Error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to load preloaders" }),
      { status: 500 }
    );
  }
}

// Add a new preloader category
export async function POST(req: Request) {
  try {
    const newCategory: PreloaderCategory = await req.json();

    const createdCategory = await prisma.preloaderCategory.create({
      data: {
        name: newCategory.name,
        value: newCategory.value,
        items: {
          create: newCategory.items,
        },
      },
      include: { items: true },
    });

    return new Response(
      JSON.stringify({
        message: "Category created successfully",
        data: createdCategory,
      }),
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
    const { categoryValue, items } = await req.json();

    const category = await prisma.preloaderCategory.findUnique({
      where: { value: categoryValue },
    });

    if (!category) {
      return new Response(JSON.stringify({ error: "Category not found" }), {
        status: 404,
      });
    }

    const createdItems = await prisma.$transaction(
      items.map((item) =>
        prisma.preloaderItem.create({
          data: {
            code: item.code,
            categoryId: category.id,
          },
        })
      )
    );

    return new Response(
      JSON.stringify({
        message: "Items added successfully",
        data: createdItems,
      }),
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
    const { categoryValue } = await req.json();

    await prisma.preloaderCategory.delete({
      where: { value: categoryValue },
    });

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
