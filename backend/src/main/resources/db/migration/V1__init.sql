CREATE TABLE members
(
    id            BIGINT       NOT NULL AUTO_INCREMENT,
    email         VARCHAR(255) NOT NULL,
    password_hash VARCHAR(100) NOT NULL,
    nickname      VARCHAR(30)  NOT NULL,
    role          VARCHAR(10)  NOT NULL DEFAULT 'USER',
    created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT uk_members_email UNIQUE (email),
    CONSTRAINT chk_members_role CHECK (role IN ('USER', 'ADMIN'))
);

CREATE TABLE brands
(
    id         BIGINT      NOT NULL AUTO_INCREMENT,
    name       VARCHAR(50) NOT NULL,
    created_at DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT uk_brands_name UNIQUE (name)
);

CREATE TABLE products
(
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    brand_id    BIGINT       NOT NULL,
    name        VARCHAR(200) NOT NULL,
    price       INT          NOT NULL,
    description TEXT,
    image_url   VARCHAR(500),
    status      VARCHAR(10)  NOT NULL DEFAULT 'ON_SALE',
    is_deleted  TINYINT(1)   NOT NULL DEFAULT 0,
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_products_brand_id FOREIGN KEY (brand_id) REFERENCES brands (id),
    CONSTRAINT chk_products_price CHECK (price > 0),
    CONSTRAINT chk_products_status CHECK (status IN ('ON_SALE', 'STOPPED'))
);

CREATE TABLE product_options
(
    id         BIGINT   NOT NULL AUTO_INCREMENT,
    product_id BIGINT   NOT NULL,
    size_mm    SMALLINT NOT NULL,
    stock      INT      NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_product_options_product_id FOREIGN KEY (product_id) REFERENCES products (id),
    CONSTRAINT uk_product_options_product_id_size_mm UNIQUE (product_id, size_mm),
    CONSTRAINT chk_product_options_size_mm CHECK (size_mm BETWEEN 150 AND 350),
    CONSTRAINT chk_product_options_stock CHECK (stock >= 0)
);

CREATE TABLE product_likes
(
    member_id  BIGINT   NOT NULL,
    product_id BIGINT   NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (member_id, product_id),
    CONSTRAINT fk_product_likes_member_id FOREIGN KEY (member_id) REFERENCES members (id),
    CONSTRAINT fk_product_likes_product_id FOREIGN KEY (product_id) REFERENCES products (id)
);

CREATE TABLE reviews
(
    id         BIGINT        NOT NULL AUTO_INCREMENT,
    member_id  BIGINT        NOT NULL,
    product_id BIGINT        NOT NULL,
    rating     TINYINT       NOT NULL,
    content    VARCHAR(1000) NOT NULL,
    created_at DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_reviews_member_id FOREIGN KEY (member_id) REFERENCES members (id),
    CONSTRAINT fk_reviews_product_id FOREIGN KEY (product_id) REFERENCES products (id),
    CONSTRAINT uk_reviews_member_id_product_id UNIQUE (member_id, product_id),
    CONSTRAINT chk_reviews_rating CHECK (rating BETWEEN 1 AND 5)
);

CREATE TABLE orders
(
    id                BIGINT       NOT NULL AUTO_INCREMENT,
    order_number      VARCHAR(32)  NOT NULL,
    member_id         BIGINT       NOT NULL,
    product_option_id BIGINT       NOT NULL,
    product_name      VARCHAR(200) NOT NULL,
    size_mm           SMALLINT     NOT NULL,
    quantity          INT          NOT NULL,
    unit_price        INT          NOT NULL,
    total_price       BIGINT       NOT NULL,
    status            VARCHAR(15)  NOT NULL DEFAULT 'ORDERED',
    idempotency_key   VARCHAR(64)  NOT NULL,
    created_at        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT uk_orders_order_number UNIQUE (order_number),
    CONSTRAINT uk_orders_member_id_idempotency_key UNIQUE (member_id, idempotency_key),
    CONSTRAINT fk_orders_member_id FOREIGN KEY (member_id) REFERENCES members (id),
    CONSTRAINT fk_orders_product_option_id FOREIGN KEY (product_option_id) REFERENCES product_options (id),
    CONSTRAINT chk_orders_quantity CHECK (quantity >= 1),
    CONSTRAINT chk_orders_unit_price CHECK (unit_price > 0),
    CONSTRAINT chk_orders_total_price CHECK (total_price = unit_price * quantity),
    CONSTRAINT chk_orders_status CHECK (status IN ('ORDERED', 'CANCELED'))
);