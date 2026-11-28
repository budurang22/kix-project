package com.kix.domain.product.repository;

import com.kix.domain.product.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {
    @Query(
            value = """
                    select p from Product p
                    join fetch p.brand b
                    where p.deleted = false
                      and (:brandId is null or b.id = :brandId)
                      and (:keyword is null or p.name like concat('%', :keyword, '%'))
                    """,
            countQuery = """
                    select count(p) from Product p
                    where p.deleted = false
                      and (:brandId is null or p.brand.id = :brandId)
                      and (:keyword is null or p.name like concat('%', :keyword, '%'))
                    """)
    Page<Product> search(
            @Param("brandId") Long brandId,
            @Param("keyword") String keyword,
            Pageable pageable);

    Optional<Product> findByIdAndDeletedFalse(Long id);
}
