
package com.kix.domain.product.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.kix.domain.product.entity.Brand;
import com.kix.domain.product.entity.Product;
import com.kix.domain.product.entity.ProductOption;
import com.kix.domain.product.repository.BrandRepository;
import com.kix.domain.product.repository.ProductOptionRepository;
import com.kix.domain.product.repository.ProductRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class ProductControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private BrandRepository brandRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ProductOptionRepository productOptionRepository;

    @Test
    @DisplayName("토큰 없이 상품 상세를 조회하면 옵션이 사이즈순으로 내려온다")
    void getProductDetail() throws Exception {
        // given
        Brand brand = brandRepository.save(new Brand("TEST-DETAIL"));
        Product product = productRepository.save(
                new Product(brand, "테스트 상품", 100000, "설명", null));
        productOptionRepository.save(new ProductOption(product, 270, 0));
        productOptionRepository.save(new ProductOption(product, 260, 3));

        // when & then
        mockMvc.perform(get("/api/products/{id}", product.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("테스트 상품"))
                .andExpect(jsonPath("$.soldOut").value(false))
                .andExpect(jsonPath("$.options[0].sizeMm").value(260))
                .andExpect(jsonPath("$.options[1].sizeMm").value(270));
    }

    @Test
    @DisplayName("없는 상품을 조회하면 404이다")
    void productNotFound() throws Exception {
        mockMvc.perform(get("/api/products/{id}", Long.MAX_VALUE))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    @DisplayName("brandId가 숫자가 아니면 400이다")
    void invalidBrandId() throws Exception {
        mockMvc.perform(get("/api/products").param("brandId", "abc"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
    }
}