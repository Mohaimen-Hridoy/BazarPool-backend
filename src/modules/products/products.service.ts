import { prisma } from '../../config/prisma.js';

export class ProductService {
  static async createProduct(supplierId: string, data: {
    title: string;
    description: string;
    category: string;
    unit: string;
    images?: string[];
  }) {
    return await prisma.product.create({
      data: {
        supplierId,
        title: data.title,
        description: data.description,
        category: data.category,
        unit: data.unit,
        images: data.images || [],
      },
    });
  }

  static async getAllProducts(filters?: { category?: string; supplierId?: string }) {
    const where: any = { isActive: true };
    if (filters?.category) where.category = filters.category;
    if (filters?.supplierId) where.supplierId = filters.supplierId;

    return await prisma.product.findMany({
      where,
      include: {
        supplier: {
          select: { id: true, fullName: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getProductById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        supplier: {
          select: { id: true, fullName: true, email: true },
        },
      },
    });

    if (!product) {
      const error: any = new Error('Product not found.');
      error.statusCode = 404;
      throw error;
    }

    return product;
  }
}
