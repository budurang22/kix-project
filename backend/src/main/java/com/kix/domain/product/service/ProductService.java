package com.kix.domain.product.service;

import com.kix.domain.product.dto.ProductDetailResponse;
import com.kix.domain.product.dto.ProductListResponse;
import com.kix.domain.product.entity.Product;
import com.kix.domain.product.entity.ProductOption;
import com.kix.domain.product.exception.ProductNotFoundException;
import com.kix.domain.product.repository.ProductOptionRepository;
import com.kix.domain.product.repository.ProductRepository;
import com.kix.global.response.PageResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductOptionRepository productOptionRepository;

    public ProductService(ProductRepository productRepository, ProductOptionRepository productOptionRepository) {
        this.productRepository = productRepository;
        this.productOptionRepository = productOptionRepository;
    }

    @Transactional(readOnly = true)
    public PageResponse<ProductListResponse> getProducts(Long brandId, String keyword, Pageable pageable) {
        String searchKeyword = (keyword == null || keyword.isBlank()) ? null : keyword.trim();

        Page<Product> products = productRepository.search(brandId, searchKeyword, pageable);

        List<Long> productIds = products.getContent().stream().map(Product::getId).toList();
        Map<Long, List<ProductOption>> optionsByProductId = productIds.isEmpty() ? Map.of() : productOptionRepository.findByProductIdIn(productIds).stream().collect(Collectors.groupingBy(option -> option.getProduct().getId()));

        return PageResponse.from(products.map(product -> ProductListResponse.from(product, isSoldOut(optionsByProductId.getOrDefault(product.getId(), List.of())))));
    }

    @Transactional(readOnly = true)
    public ProductDetailResponse getProduct(Long id) {
        Product product = productRepository.findByIdAndDeletedFalse(id).orElseThrow(ProductNotFoundException::new);

        List<ProductOption> options = productOptionRepository.findByProductIdOrderBySizeMmAsc(id);

        return ProductDetailResponse.from(product, options, isSoldOut(options));
    }

    private boolean isSoldOut(List<ProductOption> options) {
        return options.stream().noneMatch(option -> option.getStock() > 0);
    }
}
