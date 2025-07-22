import { Router } from "express";
import { promises as fs } from 'fs';
import { readFileSync, existsSync } from 'fs'; // Add existsSync to the import
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import path from 'path';

const router = Router();

// Get the current file's directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const UPLOADS_DIR = path.join(__dirname, '../data/downloads');

// Load the JSON data
const data = JSON.parse(readFileSync(join(__dirname, '../data/products.json'), 'utf8'));

// Helper function to find similar products
function findSimilarProducts(currentProductId, maxResults = 4) {
  const currentProduct = data.products[currentProductId];
  if (!currentProduct) return [];

  // Find which category and classification this product belongs to
  let productCategory = null;
  let productClassification = null;

  // Search through categories
  for (const [categoryId, category] of Object.entries(data.categories)) {
    // Check if product is directly in category
    if (category.products && category.products.includes(currentProductId)) {
      productCategory = categoryId;
      break;
    }

    // Check if product is in a classification
    if (category.classifications) {
      for (const [classificationId, classification] of Object.entries(category.classifications)) {
        if (classification.products && classification.products.includes(currentProductId)) {
          productCategory = categoryId;
          productClassification = classificationId;
          break;
        }
      }
      if (productCategory) break;
    }
  }

  let similarProducts = [];

  if (productCategory) {
    const category = data.categories[productCategory];

    // If product is in a classification, get other products from same classification first
    if (productClassification && category.classifications) {
      const classification = category.classifications[productClassification];
      const classificationProducts = classification.products
        .filter(id => id !== currentProductId && data.products[id])
        .map(id => ({ key: id, ...data.products[id] }));

      similarProducts.push(...classificationProducts);
    }

    // Then get other products from the same category
    if (category.products) {
      const categoryProducts = category.products
        .filter(id => id !== currentProductId && data.products[id])
        .map(id => ({ key: id, ...data.products[id] }));

      similarProducts.push(...categoryProducts);
    }

    // If we still need more products, get from other classifications in the same category
    if (similarProducts.length < maxResults && category.classifications) {
      for (const [classId, classification] of Object.entries(category.classifications)) {
        if (classId !== productClassification) {
          const otherClassProducts = classification.products
            .filter(id => id !== currentProductId && data.products[id])
            .map(id => ({ key: id, ...data.products[id] }));

          similarProducts.push(...otherClassProducts);
        }
      }
    }
  }

  // Remove duplicates and limit results
  const uniqueProducts = similarProducts.filter((product, index, self) =>
    index === self.findIndex(p => p.key === product.key)
  );

  return uniqueProducts.slice(0, maxResults);
}

// Helper function to get all products with filtering
function getFilteredProducts(filters = {}) {
  const { sector, category, classification, market, type, search } = filters;

  let filteredProducts = Object.entries(data.products)
    .map(([key, product]) => ({ key, ...product }));

  // Filter by sector
  if (sector) {
    filteredProducts = filteredProducts.filter(product => {
      if (Array.isArray(product.sector)) {
        return product.sector.includes(sector);
      }
      return product.sector === sector;
    });
  }

  // Filter by category
  if (category) {
    filteredProducts = filteredProducts.filter(product =>
      product.category === category
    );
  }

  // Filter by classification (subcategory)
  if (classification) {
    filteredProducts = filteredProducts.filter(product =>
      product.subcategory === classification
    );
  }

  // Filter by market
  if (market) {
    filteredProducts = filteredProducts.filter(product => {
      if (Array.isArray(product.market)) {
        return product.market.includes(market);
      }
      return product.market === market;
    });
  }

  // Filter by type
  if (type) {
    filteredProducts = filteredProducts.filter(product =>
      product.type === type
    );
  }

  // Filter by search term
  if (search) {
    const searchLower = search.toLowerCase();
    filteredProducts = filteredProducts.filter(product =>
      product.title.toLowerCase().includes(searchLower) ||
      product.description.toLowerCase().includes(searchLower)
    );
  }

  return filteredProducts;
}

// Helper function to get sidebar data
function getSidebarData() {
  const sectors = new Set();
  const categories = {};
  const types = new Set();

  // Collect all unique sectors, markets, and types from products
  Object.values(data.products).forEach(product => {
    // Sectors
    if (Array.isArray(product.sector)) {
      product.sector.forEach(s => sectors.add(s));
    } else {
      sectors.add(product.sector);
    }

    // Types
    if (product.type) {
      types.add(product.type);
    }
  });

  // Process categories with their classifications
  Object.entries(data.categories).forEach(([categoryId, category]) => {
    categories[categoryId] = {
      title: category.title,
      hasClassifications: category.hasClassifications,
      classifications: category.classifications || {}
    };
  });

  return {
    sectors: Array.from(sectors),
    categories,
    types: Array.from(types)
  };
}

// Helper function to check if a slug is a category
function findCategoryBySlug(slug) {
  return Object.entries(data.categories).find(([categoryId, category]) =>
    categoryId === slug
  );
}

// Helper function to check if a slug is a classification
function findClassificationBySlug(slug) {
  for (const [categoryId, category] of Object.entries(data.categories)) {
    if (category.classifications) {
      const classification = Object.entries(category.classifications).find(([classificationId, classification]) =>
        classificationId === slug
      );
      if (classification) {
        return {
          classificationId: classification[0],
          classification: classification[1],
          categoryId: categoryId
        };
      }
    }
  }
  return null;
}

// Helper function to check if a slug is a product
function findProductBySlug(slug) {
  return data.products[slug] ? { key: slug, ...data.products[slug] } : null;
}

// Helper function to check if a slug is a sector
function findSectorBySlug(slug) {
  const sectors = new Set();
  Object.values(data.products).forEach(product => {
    if (Array.isArray(product.sector)) {
      product.sector.forEach(s => sectors.add(s));
    } else {
      sectors.add(product.sector);
    }
  });
  return Array.from(sectors).includes(slug);
}

// Main products page - shows all products with sidebar filtering
router.get('/our-products', (req, res) => {
  const filters = {
    sector: req.query.sector,
    category: req.query.category,
    classification: req.query.classification,
    market: req.query.market,
    type: req.query.type,
    search: req.query.search
  };

  const filteredProducts = getFilteredProducts(filters);
  const sidebarData = getSidebarData();

  res.render('products/index', {
    title: 'Products',
    products: filteredProducts,
    sidebar: sidebarData,
    filters,
    totalResults: filteredProducts.length
  });
});

// Dynamic route handler for SEO-friendly URLs
router.get('/:slug', (req, res) => {
  const slug = req.params.slug;

  // Check if it's a product first (highest priority)
  const product = findProductBySlug(slug);
  if (product) {
    const similarProducts = findSimilarProducts(slug, 4);

    return res.render('products/product', {
      title: product.title,
      product,
      similarProducts
    });
  }

  // Check if it's a classification
  const classificationData = findClassificationBySlug(slug);
  if (classificationData) {
    const filters = {
      sector: req.query.sector,
      category: req.query.category,
      classification: classificationData.classificationId,
      market: req.query.market,
      type: req.query.type,
      search: req.query.search
    };

    const filteredProducts = getFilteredProducts(filters);
    const sidebarData = getSidebarData();

    return res.render('products/index', {
      title: `${classificationData.classification.title} Products`,
      description: `${classificationData.classification.description}`,
      products: filteredProducts,
      sidebar: sidebarData,
      filters,
      totalResults: filteredProducts.length
    });
  }

  // Check if it's a category
  const categoryData = findCategoryBySlug(slug);
  if (categoryData) {
    const [categoryId, category] = categoryData;

    const filters = {
      sector: req.query.sector,
      category: categoryId,
      classification: req.query.classification,
      market: req.query.market,
      type: req.query.type,
      search: req.query.search
    };

    const filteredProducts = getFilteredProducts(filters);
    const sidebarData = getSidebarData();

    return res.render('products/index', {
      title: `${category.title} Products`,
      description: `${category.description}`,
      products: filteredProducts,
      sidebar: sidebarData,
      filters,
      totalResults: filteredProducts.length
    });
  }

  // Check if it's a sector
  const isSector = findSectorBySlug(slug);
  if (isSector) {
    const filters = {
      sector: slug,
      category: req.query.category,
      classification: req.query.classification,
      market: req.query.market,
      type: req.query.type,
      search: req.query.search
    };

    const filteredProducts = getFilteredProducts(filters);
    const sidebarData = getSidebarData();

    return res.render('products/index', {
      title: `${slug.charAt(0).toUpperCase() + slug.slice(1)} Products`,
      products: filteredProducts,
      sidebar: sidebarData,
      filters,
      totalResults: filteredProducts.length
    });
  }

  // If nothing matches, return 404
  return res.status(404).render('404', { message: 'Page not found' });
});

// Download route
router.get('/products/download/:productId/:fileType/:fileIndex', (req, res) => {
  const { productId, fileType, fileIndex } = req.params;
  
  // Get the product
  const product = data.products[productId];
  if (!product || !product.downloads) {
    return res.status(404).json({ error: 'Product or downloads not found' });
  }
  
  // Get the specific file type downloads
  const downloads = product.downloads[fileType];
  if (!downloads || !downloads[parseInt(fileIndex)]) {
    return res.status(404).json({ error: 'File not found' });
  }
  
  const file = downloads[parseInt(fileIndex)];
  const filePath = path.join(UPLOADS_DIR, file.url);
  console.log('Looking for file at:', filePath);
console.log('File object:', file);

  // Use existsSync which is now properly imported
  if (!existsSync(filePath)) {
    return res.status(404).json({ error: 'PDF file not found' });
  }
  

  res.download(filePath);
});

export default router;