package com.kix.domain.order.service;

import com.kix.domain.member.entity.Member;
import com.kix.domain.member.repository.MemberRepository;
import com.kix.domain.order.entity.Order;
import com.kix.domain.order.exception.IdempotencyKeyConflictException;
import com.kix.domain.order.repository.OrderRepository;
import com.kix.domain.product.entity.ProductOption;
import com.kix.domain.product.exception.ProductOptionNotFoundException;
import com.kix.domain.product.repository.ProductOptionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final MemberRepository memberRepository;
    private final ProductOptionRepository productOptionRepository;

    public OrderService(OrderRepository orderRepository, MemberRepository memberRepository,  ProductOptionRepository productOptionRepository) {
        this.orderRepository = orderRepository;
        this.memberRepository = memberRepository;
        this.productOptionRepository = productOptionRepository;
    }

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public Order createOrder(Long memberId, Long productOptionId, int quantity, String idempotencyKey) {
        ProductOption option = productOptionRepository.findByIdForUpdate(productOptionId).orElseThrow(ProductOptionNotFoundException::new);

        Member member =memberRepository.findById(memberId).orElseThrow();

        Optional<Order> existing = orderRepository.findByMemberIdAndIdempotencyKey(memberId, idempotencyKey);

        if (existing.isPresent()) {
            Order order = existing.get();
            if (!order.isSameRequest(productOptionId, quantity)) {
                throw new IdempotencyKeyConflictException();
            }
            return existing.get();
        }

        Order order = Order.create(member, option, quantity, idempotencyKey);

        return orderRepository.save(order);
    }
}
