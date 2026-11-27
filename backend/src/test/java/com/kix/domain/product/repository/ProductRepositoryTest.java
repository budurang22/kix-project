
package com.kix.domain.product.repository;

import static org.assertj.core.api.Assertions.assertThat;

import com.kix.domain.product.entity.Brand;
import com.kix.domain.product.entity.Product;
import com.kix.domain.product.entity.ProductOption;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@Transactional
class ProductRepositoryTest {

    @Autowired
    private BrandRepository brandRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ProductOptionRepository productOptionRepository;

    @Test
    @DisplayName("브랜드, 상품, 옵션을 저장하고 옵션으로 상품을 조회한다")
    void saveBrandProductOption() {
        // given
        Brand brand = brandRepository.save(new Brand("NEW BALANCE"));
        Product product = productRepository.save(
                new Product(brand, "993", 259000, "클래식 러닝화", null));

        // when
        ProductOption option = productOptionRepository.save(new ProductOption(product, 270, 10));

        // then
        assertThat(option.getId()).isNotNull();
        assertThat(option.getProduct().getName()).isEqualTo("993");
    }
}