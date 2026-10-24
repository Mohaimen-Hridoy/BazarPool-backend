import { Request, Response, NextFunction } from 'express';
import { ProductService } from './products.service.js';
import { sendResponse } from '../../utils/response.js';

export class ProductController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const supplierId = req.user!.id;
      const product = await ProductService.createProduct(supplierId, req.body);
      sendResponse(res, {
        statusCode: 201,
        message: 'Product catalog item created successfully.',
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { category, supplierId } = req.query as { category?: string; supplierId?: string };
      const products = await ProductService.getAllProducts({ category, supplierId });
      sendResponse(res, {
        statusCode: 200,
        message: 'Products retrieved successfully.',
        data: products,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const product = await ProductService.getProductById(id);
      sendResponse(res, {
        statusCode: 200,
        message: 'Product retrieved successfully.',
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }
}
