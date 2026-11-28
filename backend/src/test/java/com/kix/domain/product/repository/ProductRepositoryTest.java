
package com.kix.domain.product.repository;

import static org.assertj.core.api.Assertions.assertThat;

import com.kix.domain.product.entity.Brand;
import com.kix.domain.product.entity.Product;
import com.kix.domain.product.entity.ProductOption;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
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

    @PersistenceContext
    private EntityManager entityManager;

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

    @Test
    @DisplayName("search는 삭제된 상품과 다른 브랜드의 상품을 제외한다")
    void searchExcludesDeletedAndOtherBrand() {
        // given
        Brand brand = brandRepository.save(new Brand("TEST-SEARCH"));
        Brand other = brandRepository.save(new Brand("TEST-OTHER"));
        productRepository.save(new Product(brand, "검색 대상", 100000, null, null));
        Product deleted = productRepository.save(
                new Product(brand, "삭제 대상", 100000, null, null));
        productRepository.save(new Product(other, "다른 브랜드", 100000, null, null));
        entityManager.flush();
        entityManager.createNativeQuery("update products set is_deleted = 1 where id = :id")
                .setParameter("id", deleted.getId())
                .executeUpdate();
        entityManager.clear();

        // when
        Page<Product> result = productRepository.search(brand.getId(), null, PageRequest.of(0, 20));

        // then
        assertThat(result.getContent()).extracting(Product::getName).containsExactly("검색 대상");
        assertThat(result.getTotalElements()).isEqualTo(1);
    }

    @Test
    @DisplayName("search는 상품명에 키워드가 포함된 상품만 조회한다")
    void searchByKeyword() {
        // given
        Brand brand = brandRepository.save(new Brand("TEST-KEYWORD"));
        productRepository.save(new Product(brand, "덩크 로우 테스트", 100000, null, null));
        productRepository.save(new Product(brand, "에어포스 테스트", 100000, null, null));

        // when
        Page<Product> result = productRepository.search(brand.getId(), "덩크", PageRequest.of(0, 20));

        // then
        assertThat(result.getContent()).extracting(Product::getName).containsExactly("덩크 로우 테스트");
    }
}