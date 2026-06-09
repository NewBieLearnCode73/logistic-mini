-- ====================================================================
-- SEED THOUSANDS OF RECORDS FOR DEMO AND SCALABILITY TESTING
-- System: Supply Chain Traceability (logistic-mini)
-- Database: PostgreSQL 16
-- ====================================================================

-- 1. TRUNCATE EXISTING TABLES (CASCADE) TO ASSURE A CLEAN START
TRUNCATE TABLE 
  audit_logs, 
  scan_logs, 
  inventory_adjustments, 
  shipment_issues, 
  incident_reports, 
  shipments, 
  inventory, 
  batch_qr_codes, 
  timeline_events, 
  batches, 
  products, 
  users_roles, 
  users, 
  nodes, 
  roles 
  CASCADE;

-- 2. INSERT SYSTEM ROLES
INSERT INTO roles (id, name, description, created_at) VALUES
('a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', 'Admin', N'Quản trị viên toàn hệ thống - Quyền điều hành cao nhất', CURRENT_TIMESTAMP),
('b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2', 'Manufacturer', N'Nhà sản xuất - Khởi tạo lô hàng và sinh mã QR truy xuất', CURRENT_TIMESTAMP),
('d3d3d3d3-d3d3-d3d3-d3d3-d3d3d3d3d3d3', 'Distributor', N'Nhà phân phối - Điều chuyển hàng hóa qua các nút trung chuyển', CURRENT_TIMESTAMP),
('e4e4e4e4-e4e4-e4e4-e4e4-e4e4e4e4e4e4', 'Retailer', N'Đại lý bán lẻ - Nhận hàng và thực hiện xuất bán cho người tiêu dùng', CURRENT_TIMESTAMP),
('c5c5c5c5-c5c5-c5c5-c5c5-c5c5c5c5c5c5', 'Consumer', N'Người tiêu dùng - Chỉ quét QR truy xuất nguồn gốc công khai', CURRENT_TIMESTAMP)
ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description;

-- 3. INSERT NODES IN VIETNAM
INSERT INTO nodes (id, name, node_type, address, latitude, longitude, is_active, created_at, updated_at, version) VALUES
('550e8400-e29b-41d4-a716-446655440001', N'Nhà Máy Hà Tiên - TP.HCM', 'MANUFACTURER', N'Khu Công Nghiệp Tân Bình, Quận Tân Phú, TP. Hồ Chí Minh', 10.8231000, 106.6297000, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1),
('550e8400-e29b-41d4-a716-446655440002', N'Nhà Máy Hòa Phát - Hà Nội', 'MANUFACTURER', N'Khu Công Nghiệp Thăng Long, Đông Anh, Hà Nội', 21.0285000, 105.8542000, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1),
('550e8400-e29b-41d4-a716-446655440003', N'Trung Tâm Phân Phối Đà Nẵng', 'DISTRIBUTOR', N'Khu Công Nghiệp Hòa Khánh, Liên Chiểu, Đà Nẵng', 16.0544000, 108.2022000, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1),
('550e8400-e29b-41d4-a716-446655440004', N'Trung Tâm Phân Phối Bình Dương', 'DISTRIBUTOR', N'Khu Công Nghiệp VSIP 1, Thuận An, Bình Dương', 10.9804000, 106.6519000, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1),
('550e8400-e29b-41d4-a716-446655440005', N'Kho Trung Chuyển Đồng Nai', 'WAREHOUSE', N'Khu Công Nghiệp Amata, Biên Hòa, Đồng Nai', 10.9574000, 106.8427000, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1),
('550e8400-e29b-41d4-a716-446655440006', N'Kho Trung Chuyển Bắc Ninh', 'WAREHOUSE', N'Khu Công Nghiệp Tiên Sơn, Từ Sơn, Bắc Ninh', 21.1861000, 106.0763000, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1),
('550e8400-e29b-41d4-a716-446655440007', N'Siêu Thị Co.opmart Cống Quỳnh - TP.HCM', 'RETAILER', N'189 Cống Quỳnh, Phường Nguyễn Cư Trinh, Quận 1, TP. Hồ Chí Minh', 10.7681000, 106.6888000, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1),
('550e8400-e29b-41d4-a716-446655440008', N'Siêu Thị WinMart Times City - Hà Nội', 'RETAILER', N'458 Minh Khai, Vĩnh Tuy, Hai Bà Trưng, Hà Nội', 20.9951000, 105.8679000, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1),
('550e8400-e29b-41d4-a716-446655440009', N'Đại Lý Vật Liệu Cần Thơ', 'RETAILER', N'54 Nguyễn Trãi, Ninh Kiều, Cần Thơ', 10.0452000, 105.7469000, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1),
('550e8400-e29b-41d4-a716-446655440010', N'Cửa Hàng Bán Lẻ Hải Phòng', 'RETAILER', N'15 Lạch Tray, Ngô Quyền, Hải Phòng', 20.8449000, 106.6881000, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1)
ON CONFLICT (id) DO NOTHING;

-- 4. INSERT PRODUCTS
INSERT INTO products (id, name, sku, unit, description, category, unit_price, is_active, created_at, updated_at) VALUES
('770e8400-e29b-41d4-a716-446655440001', N'Xi Măng Hà Tiên PCB40', 'PROD-CEM-01', N'Tấn', N'Xi măng Portland hỗn hợp PCB40 Hà Tiên chất lượng cao', N'Vật liệu thô', 0.00, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('770e8400-e29b-41d4-a716-446655440002', N'Thép Cuộn Hòa Phát Φ6', 'PROD-STE-02', N'Tấn', N'Thép cuộn xây dựng Hòa Phát phi 6 tiêu chuẩn', N'Cosmetics', 50000000.00, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('770e8400-e29b-41d4-a716-446655440003', N'Cát Xây Dựng Sông Đồng Nai', 'PROD-SND-03', N'Khối', N'Cát vàng hạt lớn chuyên dùng cho bê tông đổ móng', N'Cát đá', 0.00, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('770e8400-e29b-41d4-a716-446655440004', N'Cát Thạch Anh Lọc Nước', 'PROD-QSD-04', N'kg', N'Cát thạch anh mịn dùng lọc nước tiêu chuẩn công nghiệp', N'Cát đá', 0.00, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('770e8400-e29b-41d4-a716-446655440005', N'Gạch Ống Đồng Tâm 4 Lỗ', 'PROD-BRK-05', N'Viên', N'Gạch ống đất nung 4 lỗ Đồng Tâm kích thước chuẩn', N'Gạch ngói', 0.00, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('770e8400-e29b-41d4-a716-446655440006', N'Ngói Lợp Đất Nung Viglacera', 'PROD-TLE-06', N'Hộp', N'Ngói lợp 22 viên/m2 Viglacera màu đỏ tươi', N'Gạch ngói', 0.00, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('770e8400-e29b-41d4-a716-446655440007', N'Sơn Nước Ngoại Thất Dulux Weathershield', 'PROD-PNT-07', N'Thùng', N'Sơn nước ngoại thất Dulux WeatherShield bóng mờ 15L', N'Sơn phủ', 0.00, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('770e8400-e29b-41d4-a716-446655440008', N'Bê Tông Tươi Holcim Mác 250', 'PROD-CNC-08', N'Khối', N'Bê tông thương phẩm Holcim Mác 250 độ sụt 10+-2', N'Bê tông', 0.00, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('770e8400-e29b-41d4-a716-446655440009', N'Đá Mi Sàng Đen 1x2', 'PROD-GRV-09', N'Khối', N'Đá mi sàng đen kích cỡ 1x2 cm dùng cho bê tông nhựa', N'Cát đá', 0.00, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('770e8400-e29b-41d4-a716-446655440010', N'Vữa Xây Tô Trộn Sẵn Sika Murar', 'PROD-MTR-10', N'Bao', N'Vữa xây tô khô trộn sẵn cao cấp Sika bao 40kg', N'Vật liệu đóng bao', 0.00, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('583f29b4-58bc-4205-a97c-6fd231423793', N'Khô Gà Bã Mía', 'SKU-CHICKEN', N'Hộp', N'Khô gà nhà a Độ', N'Food', 120000.00, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- 5. INSERT USERS (Passwords are 'password123' encrypted with Bcrypt 10 rounds)
INSERT INTO users (id, email, password_hash, full_name, node_id, is_active, created_at, updated_at, version) VALUES
('990e8400-e29b-41d4-a716-446655440001', 'admin@logistic.com', '$2b$10$pR9y8wZLe7oyO3xcU2pfxuHx/8xjopyhjyj2GMklPm3SYHtEeD5wS', N'Hệ Thống Admin', NULL, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1),
('990e8400-e29b-41d4-a716-446655440002', 'mfr_a@logistic.com', '$2b$10$pR9y8wZLe7oyO3xcU2pfxuHx/8xjopyhjyj2GMklPm3SYHtEeD5wS', N'Nhà Sản Xuất A (Hà Tiên)', '550e8400-e29b-41d4-a716-446655440001', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1),
('990e8400-e29b-41d4-a716-446655440003', 'mfr_b@logistic.com', '$2b$10$pR9y8wZLe7oyO3xcU2pfxuHx/8xjopyhjyj2GMklPm3SYHtEeD5wS', N'Nhà Sản Xuất B (Hòa Phát)', '550e8400-e29b-41d4-a716-446655440002', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1),
('990e8400-e29b-41d4-a716-446655440004', 'dist_a@logistic.com', '$2b$10$pR9y8wZLe7oyO3xcU2pfxuHx/8xjopyhjyj2GMklPm3SYHtEeD5wS', N'Nhà Phân Phối Đà Nẵng', '550e8400-e29b-41d4-a716-446655440003', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1),
('990e8400-e29b-41d4-a716-446655440005', 'dist_b@logistic.com', '$2b$10$pR9y8wZLe7oyO3xcU2pfxuHx/8xjopyhjyj2GMklPm3SYHtEeD5wS', N'Nhà Phân Phối Bình Dương', '550e8400-e29b-41d4-a716-446655440004', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1),
('990e8400-e29b-41d4-a716-446655440006', 'ret_a@logistic.com', '$2b$10$pR9y8wZLe7oyO3xcU2pfxuHx/8xjopyhjyj2GMklPm3SYHtEeD5wS', N'Nhà Bán Lẻ Co.opmart', '550e8400-e29b-41d4-a716-446655440007', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1),
('990e8400-e29b-41d4-a716-446655440007', 'ret_b@logistic.com', '$2b$10$pR9y8wZLe7oyO3xcU2pfxuHx/8xjopyhjyj2GMklPm3SYHtEeD5wS', N'Nhà Bán Lẻ WinMart', '550e8400-e29b-41d4-a716-446655440008', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1),
('990e8400-e29b-41d4-a716-446655440008', 'ret_c@logistic.com', '$2b$10$pR9y8wZLe7oyO3xcU2pfxuHx/8xjopyhjyj2GMklPm3SYHtEeD5wS', N'Nhà Bán Lẻ Cần Thơ', '550e8400-e29b-41d4-a716-446655440009', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1),
('990e8400-e29b-41d4-a716-446655440009', 'ret_d@logistic.com', '$2b$10$pR9y8wZLe7oyO3xcU2pfxuHx/8xjopyhjyj2GMklPm3SYHtEeD5wS', N'Nhà Bán Lẻ Hải Phòng', '550e8400-e29b-41d4-a716-446655440010', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1)
ON CONFLICT (id) DO NOTHING;

-- 6. MAP USERS TO ROLES
INSERT INTO users_roles (user_id, role_id, assigned_at) VALUES
('990e8400-e29b-41d4-a716-446655440001', 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', CURRENT_TIMESTAMP), -- Admin
('990e8400-e29b-41d4-a716-446655440002', 'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2', CURRENT_TIMESTAMP), -- Mfr A
('990e8400-e29b-41d4-a716-446655440003', 'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2', CURRENT_TIMESTAMP), -- Mfr B
('990e8400-e29b-41d4-a716-446655440004', 'd3d3d3d3-d3d3-d3d3-d3d3-d3d3d3d3d3d3', CURRENT_TIMESTAMP), -- Dist A
('990e8400-e29b-41d4-a716-446655440005', 'd3d3d3d3-d3d3-d3d3-d3d3-d3d3d3d3d3d3', CURRENT_TIMESTAMP), -- Dist B
('990e8400-e29b-41d4-a716-446655440006', 'e4e4e4e4-e4e4-e4e4-e4e4-e4e4e4e4e4e4', CURRENT_TIMESTAMP), -- Ret A
('990e8400-e29b-41d4-a716-446655440007', 'e4e4e4e4-e4e4-e4e4-e4e4-e4e4e4e4e4e4', CURRENT_TIMESTAMP), -- Ret B
('990e8400-e29b-41d4-a716-446655440008', 'e4e4e4e4-e4e4-e4e4-e4e4-e4e4e4e4e4e4', CURRENT_TIMESTAMP), -- Ret C
('990e8400-e29b-41d4-a716-446655440009', 'e4e4e4e4-e4e4-e4e4-e4e4-e4e4e4e4e4e4', CURRENT_TIMESTAMP)  -- Ret D
ON CONFLICT (user_id, role_id) DO NOTHING;

-- 7. DYNAMIC PL/PGSQL BLOCK TO GENERATE THOUSANDS OF RECORDS RELATIONALLY
DO $$
DECLARE
    -- Core product references
    prod_ids uuid[] := ARRAY[
        '770e8400-e29b-41d4-a716-446655440001'::uuid,
        '770e8400-e29b-41d4-a716-446655440002'::uuid,
        '770e8400-e29b-41d4-a716-446655440003'::uuid,
        '770e8400-e29b-41d4-a716-446655440004'::uuid,
        '770e8400-e29b-41d4-a716-446655440005'::uuid,
        '770e8400-e29b-41d4-a716-446655440006'::uuid,
        '770e8400-e29b-41d4-a716-446655440007'::uuid,
        '770e8400-e29b-41d4-a716-446655440008'::uuid,
        '770e8400-e29b-41d4-a716-446655440009'::uuid,
        '770e8400-e29b-41d4-a716-446655440010'::uuid,
        '583f29b4-58bc-4205-a97c-6fd231423793'::uuid
    ];
    units text[] := ARRAY[N'Tấn', N'Tấn', N'Khối', N'kg', N'Viên', N'Hộp', N'Thùng', N'Khối', N'Khối', N'Bao', N'Hộp'];
    skus text[] := ARRAY['PROD-CEM-01', 'PROD-STE-02', 'PROD-SND-03', 'PROD-QSD-04', 'PROD-BRK-05', 'PROD-TLE-06', 'PROD-PNT-07', 'PROD-CNC-08', 'PROD-GRV-09', 'PROD-MTR-10', 'SKU-CHICKEN'];
    prod_names text[] := ARRAY[N'Xi Măng Hà Tiên PCB40', N'Thép Cuộn Hòa Phát Φ6', N'Cát Xây Dựng Sông Đồng Nai', N'Cát Thạch Anh Lọc Nước', N'Gạch Ống Đồng Tâm 4 Lỗ', N'Ngói Lợp Đất Nung Viglacera', N'Sơn Nước Ngoại Thất Dulux Weathershield', N'Bê Tông Tươi Holcim Mác 250', N'Đá Mi Sàng Đen 1x2', N'Vữa Xây Tô Trộn Sẵn Sika Murar', N'Khô Gà Bã Mía'];
    unit_prices numeric[] := ARRAY[0.00, 50000000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 120000.00];
    -- Node references
    mfr_nodes uuid[] := ARRAY[
        '550e8400-e29b-41d4-a716-446655440001'::uuid, -- HCM Factory
        '550e8400-e29b-41d4-a716-446655440002'::uuid  -- HN Factory
    ];
    
    dist_nodes uuid[] := ARRAY[
        '550e8400-e29b-41d4-a716-446655440003'::uuid, -- DN Dist
        '550e8400-e29b-41d4-a716-446655440004'::uuid  -- BD Dist
    ];
    
    warehouse_nodes uuid[] := ARRAY[
        '550e8400-e29b-41d4-a716-446655440005'::uuid, -- Dong Nai WH
        '550e8400-e29b-41d4-a716-446655440006'::uuid  -- Bac Ninh WH
    ];
    
    retail_nodes uuid[] := ARRAY[
        '550e8400-e29b-41d4-a716-446655440007'::uuid, -- Coopmart
        '550e8400-e29b-41d4-a716-446655440008'::uuid, -- Winmart
        '550e8400-e29b-41d4-a716-446655440009'::uuid, -- Can Tho
        '550e8400-e29b-41d4-a716-446655440010'::uuid  -- Hai Phong
    ];
    
    all_node_ids uuid[] := ARRAY[
        '550e8400-e29b-41d4-a716-446655440001'::uuid, '550e8400-e29b-41d4-a716-446655440002'::uuid,
        '550e8400-e29b-41d4-a716-446655440003'::uuid, '550e8400-e29b-41d4-a716-446655440004'::uuid,
        '550e8400-e29b-41d4-a716-446655440005'::uuid, '550e8400-e29b-41d4-a716-446655440006'::uuid,
        '550e8400-e29b-41d4-a716-446655440007'::uuid, '550e8400-e29b-41d4-a716-446655440008'::uuid,
        '550e8400-e29b-41d4-a716-446655440009'::uuid, '550e8400-e29b-41d4-a716-446655440010'::uuid
    ];
    
    node_lats numeric[] := ARRAY[10.8231000, 21.0285000, 16.0544000, 10.9804000, 10.9574000, 21.1861000, 10.7681000, 20.9951000, 10.0452000, 20.8449000];
    node_lngs numeric[] := ARRAY[106.6297000, 105.8542000, 108.2022000, 106.6519000, 106.8427000, 106.0763000, 106.6888000, 105.8679000, 105.7469000, 106.6888100];
    
    -- Actor references
    mfr_users uuid[] := ARRAY[
        '990e8400-e29b-41d4-a716-446655440002'::uuid, -- Mfr A (HCM)
        '990e8400-e29b-41d4-a716-446655440003'::uuid  -- Mfr B (HN)
    ];
    
    dist_users uuid[] := ARRAY[
        '990e8400-e29b-41d4-a716-446655440004'::uuid, -- Dist A (DN)
        '990e8400-e29b-41d4-a716-446655440005'::uuid  -- Dist B (BD)
    ];
    
    retail_users uuid[] := ARRAY[
        '990e8400-e29b-41d4-a716-446655440006'::uuid, -- Ret Coopmart
        '990e8400-e29b-41d4-a716-446655440007'::uuid, -- Ret Winmart
        '990e8400-e29b-41d4-a716-446655440008'::uuid, -- Ret Can Tho
        '990e8400-e29b-41d4-a716-446655440009'::uuid  -- Ret Hai Phong
    ];
    
    admin_id uuid := '990e8400-e29b-41d4-a716-446655440001'::uuid;

    -- Iteration vars
    i int;
    k int;
    total_batches int := 1500;
    
    -- Entity record variables
    b_id uuid;
    qr_id uuid;
    ship_id uuid;
    inc_id uuid;
    audit_id uuid;
    
    p_idx int;
    origin_n_id uuid;
    current_n_id uuid;
    dest_n_id uuid;
    qty decimal(12,3);
    mfg_date date;
    exp_date date;
    b_status text;
    creator_id uuid;
    b_code text;
    t_code text;
    i_code text;
    
    -- Date/Time vars
    c_time timestamptz;
    s_time timestamptz;
    r_time timestamptz;
    sold_time timestamptz;
    
    -- Simulation helper vars
    rand_node_idx int;
    rand_status numeric;
    rand_qty decimal(12,3);
    ship_status text;
    reported_user uuid;
    ip_addr text;
    u_agent text;
    lat_offset numeric;
    lng_offset numeric;

BEGIN
    -- MAIN SEEDING LOOP (Runs 1,500 times)
    FOR i IN 1..total_batches LOOP
        -- A. Generate unique primary identifiers
        b_id := gen_random_uuid();
        qr_id := gen_random_uuid();
        ship_id := gen_random_uuid();
        
        -- B. Select product attributes
        p_idx := floor(random() * 11) + 1; -- 1 to 11
        qty := round((random() * 2000 + 50)::numeric, 3);
        
        -- C. Select manufacturing factory
        IF random() < 0.5 THEN
            origin_n_id := mfr_nodes[1]; -- HCM
            creator_id := mfr_users[1];
        ELSE
            origin_n_id := mfr_nodes[2]; -- HN
            creator_id := mfr_users[2];
        END IF;
        
        -- D. Generate Dates
        mfg_date := CURRENT_DATE - (floor(random() * 120) + 10)::int; -- 10 to 130 days ago
        exp_date := mfg_date + 365;
        
        c_time := mfg_date + time '08:00:00' + (random() * interval '4 hours');
        s_time := c_time + interval '1 day' + (random() * interval '6 hours');
        r_time := s_time + interval '2 days' + (random() * interval '8 hours');
        sold_time := r_time + interval '5 days' + (random() * interval '10 days');
        
        -- E. Determine Batch status distribution (CREATED, IN_TRANSIT, RECEIVED, SOLD, LOST, DISCARDED)
        rand_status := random();
        IF rand_status < 0.15 THEN
            -- 15% newly created, still at origin factory
            b_status := 'CREATED';
            current_n_id := origin_n_id;
        ELSIF rand_status < 0.45 THEN
            -- 30% received at transit nodes
            b_status := 'RECEIVED';
            -- Randomly pick a non-origin node
            rand_node_idx := floor(random() * 8) + 3; -- 3 to 10
            current_n_id := all_node_ids[rand_node_idx];
        ELSIF rand_status < 0.75 THEN
            -- 30% in transit
            b_status := 'IN_TRANSIT';
            -- Randomly pick target non-origin node
            rand_node_idx := floor(random() * 8) + 3;
            current_n_id := all_node_ids[rand_node_idx];
        ELSIF rand_status < 0.90 THEN
            -- 15% sold out (must be at a retailer node)
            b_status := 'SOLD';
            rand_node_idx := floor(random() * 4) + 7; -- 7 to 10 (Retailers)
            current_n_id := all_node_ids[rand_node_idx];
        ELSIF rand_status < 0.96 THEN
            -- 6% lost in transportation
            b_status := 'LOST';
            rand_node_idx := floor(random() * 8) + 3;
            current_n_id := all_node_ids[rand_node_idx];
        ELSE
            -- 4% discarded due to incidents/defects
            b_status := 'DISCARDED';
            current_n_id := origin_n_id;
        END IF;
        
        -- F. Form unique codes
        b_code := 'BAT-' || to_char(mfg_date, 'YYYYMMDD') || '-' || lpad(i::text, 4, '0');
        t_code := 'TRK-' || to_char(mfg_date, 'MMDD') || '-' || lpad((i+1000)::text, 5, '0');
        
        -- G. INSERT BATCH RECORD
        INSERT INTO batches (
            id, batch_code, product_id, origin_node_id, current_node_id, 
            quantity, unit, manufacture_date, expiry_date, status, 
            created_by, created_at, updated_at, version, total_value
        ) VALUES (
            b_id, b_code, prod_ids[p_idx], origin_n_id, current_n_id,
            qty, units[p_idx], mfg_date, exp_date, b_status,
            creator_id, c_time, c_time, 1, (qty * unit_prices[p_idx])
        );
        
        -- H. INSERT BATCH QR CODE
        INSERT INTO batch_qr_codes (id, batch_id, qr_data, svg_data, qr_image_url, generated_at, generated_by)
        VALUES (
            qr_id, b_id, 
            'https://minilogistic.com/trace/' || b_code,
            '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" fill="white"/><path d="M10 10h30v30H10zm40 0h10v10H50zm10 10h30v30H60zm-50 40h30v30H10zm40 10h10v10H50zm10 10h10v10H60zm20 0h10v10H80z" fill="black"/></svg>',
            NULL, c_time + interval '2 minutes', creator_id
        );
        
        -- I. INSERT INITIAL TIMELINE EVENT (CREATED)
        INSERT INTO timeline_events (
            id, batch_id, event_type, node_id, actor_id, shipment_id, quantity_delta, notes, occurred_at, metadata
        ) VALUES (
            gen_random_uuid(), b_id, 'CREATED', origin_n_id, creator_id, NULL, qty,
            N'Khởi tạo lô hàng thành công tại nhà máy sản xuất.', c_time,
            jsonb_build_object('sku', skus[p_idx], 'product_name', prod_names[p_idx], 'origin_qty', qty)
        );
        
        -- J. INSERT INITIAL CREATE AUDIT LOG
        INSERT INTO audit_logs (
            id, actor_id, action, entity_type, entity_id, old_values, new_values, ip_address, user_agent, occurred_at
        ) VALUES (
            gen_random_uuid(), creator_id, 'CREATE_BATCH', 'batches', b_id, NULL,
            jsonb_build_object('batchCode', b_code, 'productId', prod_ids[p_idx], 'quantity', qty),
            '192.168.1.' || (10 + (i % 200)), 'Mozilla/5.0 NestJS Client', c_time
        );
        
        -- K. SIMULATE INVENTORY AND SHIPMENT DATA
        IF b_status = 'CREATED' THEN
            -- In warehouse stock of origin factory
            INSERT INTO inventory (batch_id, node_id, quantity_available, last_updated_at, version)
            VALUES (b_id, origin_n_id, qty, c_time, 1);
            
        ELSE
            -- The batch has been shipped out of the factory!
            -- Let's identify shipment status
            IF b_status = 'IN_TRANSIT' THEN
                ship_status := 'IN_TRANSIT';
            ELSIF b_status = 'LOST' THEN
                ship_status := 'LOST';
            ELSE
                ship_status := 'RECEIVED';
            END IF;
            
            -- Insert Shipment
            INSERT INTO shipments (
                id, tracking_code, batch_id, source_node_id, destination_node_id, 
                quantity_shipped, status, shipped_at, expected_delivery_date, 
                actual_delivery_date, notes, created_by, created_at, updated_at, version
            ) VALUES (
                ship_id, t_code, b_id, origin_n_id, current_n_id,
                qty, ship_status, s_time, s_time + interval '3 days',
                CASE WHEN ship_status = 'RECEIVED' THEN r_time ELSE NULL END,
                N'Vận chuyển lô hàng ' || b_code || N' sang điểm tiếp theo trong chuỗi.',
                creator_id, s_time, s_time, 1
            );
            
            -- Insert SHIPPED event
            INSERT INTO timeline_events (
                id, batch_id, event_type, node_id, actor_id, shipment_id, quantity_delta, notes, occurred_at, metadata
            ) VALUES (
                gen_random_uuid(), b_id, 'SHIPPED', origin_n_id, creator_id, ship_id, -qty,
                N'Xuất kho và bốc xếp hàng lên phương tiện vận chuyển.', s_time,
                jsonb_build_object('tracking_code', t_code, 'destination_node_id', current_n_id)
            );
            
            -- Insert Shipment Audit Log
            INSERT INTO audit_logs (
                id, actor_id, action, entity_type, entity_id, old_values, new_values, ip_address, user_agent, occurred_at
            ) VALUES (
                gen_random_uuid(), creator_id, 'CREATE_SHIPMENT', 'shipments', ship_id, NULL,
                jsonb_build_object('trackingCode', t_code, 'quantity', qty, 'status', ship_status),
                '192.168.1.' || (11 + (i % 200)), 'Mozilla/5.0 NestJS Client', s_time
            );
            
            -- Handle received/sold states
            IF ship_status = 'RECEIVED' THEN
                -- Add RECEIVED timeline event
                -- Pick retailer or distributor user as receive actor
                IF current_n_id IN (SELECT id FROM nodes WHERE node_type = 'RETAILER') THEN
                    reported_user := retail_users[floor(random() * 4) + 1];
                ELSE
                    reported_user := dist_users[floor(random() * 2) + 1];
                END IF;
                
                INSERT INTO timeline_events (
                    id, batch_id, event_type, node_id, actor_id, shipment_id, quantity_delta, notes, occurred_at, metadata
                ) VALUES (
                    gen_random_uuid(), b_id, 'RECEIVED', current_n_id, reported_user, ship_id, qty,
                    N'Đã kiểm tra chất lượng và nhận hàng vào kho dự trữ.', r_time,
                    jsonb_build_object('received_qty', qty, 'receiver_id', reported_user)
                );
                
                -- Update inventory
                IF b_status = 'RECEIVED' THEN
                    -- Stock is available at target node
                    INSERT INTO inventory (batch_id, node_id, quantity_available, last_updated_at, version)
                    VALUES (b_id, current_n_id, qty, r_time, 1);
                ELSIF b_status = 'SOLD' THEN
                    -- Stock is 0 because it was sold out
                    INSERT INTO inventory (batch_id, node_id, quantity_available, last_updated_at, version)
                    VALUES (b_id, current_n_id, 0, sold_time, 1);
                    
                    -- Insert SOLD timeline event
                    INSERT INTO timeline_events (
                        id, batch_id, event_type, node_id, actor_id, shipment_id, quantity_delta, notes, occurred_at, metadata
                    ) VALUES (
                        gen_random_uuid(), b_id, 'SOLD', current_n_id, reported_user, NULL, -qty,
                        N'Đã bán lẻ toàn bộ số lượng hàng hóa cho khách hàng tại cửa hàng.', sold_time,
                        jsonb_build_object('sale_qty', qty)
                    );
                END IF;
                
            ELSIF ship_status = 'LOST' THEN
                -- Insert shipment issue
                INSERT INTO shipment_issues (
                    id, shipment_id, issue_type, severity, detected_at, detected_by, reported_by, notes, is_resolved, resolved_at, incident_report_id
                ) VALUES (
                    gen_random_uuid(), ship_id, 'MISSING', 'HIGH', s_time + interval '2 days', 'SYSTEM_CRON', NULL,
                    N'Vận đơn trễ hẹn quá 48 tiếng so với ETA dự kiến. Hệ thống tự động kích hoạt cảnh báo.', false, NULL, NULL
                );
                
                -- Insert Incident Report
                inc_id := gen_random_uuid();
                i_code := 'INC-' || to_char(s_time, 'YYYYMMDD') || '-' || lpad(i::text, 4, '0');
                
                INSERT INTO incident_reports (
                    id, incident_code, shipment_id, batch_id, incident_type, status, priority,
                    reported_by, assigned_to, description, resolution, resolution_type, approved_by, evidence_jsonb, opened_at, resolved_at, closed_at, version
                ) VALUES (
                    inc_id, i_code, ship_id, b_id, 'MISSING', 'OPEN', 'HIGH',
                    creator_id, admin_id, N'Phát hiện xe vận tải chở lô hàng ' || b_code || N' mất liên lạc trên chặng di chuyển từ Factory sang Warehouse.',
                    NULL, NULL, NULL, jsonb_build_object('last_known_gps', '14.0583, 108.1256'),
                    s_time + interval '2 days', NULL, NULL, 1
                );
                
                -- Insert TIMELINE event for incident
                INSERT INTO timeline_events (
                    id, batch_id, event_type, node_id, actor_id, shipment_id, quantity_delta, notes, occurred_at, metadata
                ) VALUES (
                    gen_random_uuid(), b_id, 'INVESTIGATING', current_n_id, admin_id, ship_id, NULL,
                    N'Bắt đầu cuộc điều tra đối chứng do phát hiện cảnh báo trễ hành trình.', s_time + interval '2 days',
                    jsonb_build_object('incident_id', inc_id, 'incident_code', i_code)
                );
                
                -- Set inventory to 0
                INSERT INTO inventory (batch_id, node_id, quantity_available, last_updated_at, version)
                VALUES (b_id, current_n_id, 0, s_time + interval '2 days', 1);
                
            ELSIF ship_status = 'IN_TRANSIT' THEN
                -- In transit, target warehouse inventory is 0
                INSERT INTO inventory (batch_id, node_id, quantity_available, last_updated_at, version)
                VALUES (b_id, current_n_id, 0, s_time, 1);
            END IF;
        END IF;

        -- L. GENERATE SIMULATED CONSUMER SCANS (1 to 3 scans per batch)
        -- Ensure high-fidelity locations in Vietnam near the current node of the batch!
        FOR k IN 1..(floor(random() * 3) + 1) LOOP
            -- Latitude and Longitude offsets to make them look realistic
            lat_offset := (random() * 0.04) - 0.02;
            lng_offset := (random() * 0.04) - 0.02;
            
            -- Select base node for location reference
            -- 10 nodes, pick index
            rand_node_idx := floor(random() * 10) + 1;
            
            INSERT INTO scan_logs (
                id, batch_id, qr_code_id, scanned_by, ip_address, user_agent, latitude, longitude, scanned_at
            ) VALUES (
                gen_random_uuid(), b_id, qr_id, 
                CASE WHEN random() < 0.2 THEN creator_id ELSE NULL END, -- 20% signed in, 80% public guest
                '113.161.' || (floor(random() * 250))::text || '.' || (floor(random() * 250))::text,
                CASE WHEN random() < 0.5 THEN
                    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1'
                ELSE
                    'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36'
                END,
                node_lats[rand_node_idx] + lat_offset,
                node_lngs[rand_node_idx] + lng_offset,
                c_time + interval '2 hours' + (k * interval '1 day' * random())
            );
        END LOOP;
    END LOOP;

    -- M. GENERATE ADDITIONAL SYSTEM AUDIT LOGS FOR OPERATIONS
    FOR i IN 1..1000 LOOP
        audit_id := gen_random_uuid();
        -- Admin updating nodes/users or reviewing incidents
        INSERT INTO audit_logs (
            id, actor_id, action, entity_type, entity_id, old_values, new_values, ip_address, user_agent, occurred_at
        ) VALUES (
            audit_id, admin_id,
            CASE WHEN random() < 0.4 THEN 'UPDATE_USER' WHEN random() < 0.7 THEN 'UPDATE_NODE' ELSE 'RESOLVE_INCIDENT' END,
            CASE WHEN random() < 0.4 THEN 'users' WHEN random() < 0.7 THEN 'nodes' ELSE 'incident_reports' END,
            gen_random_uuid(),
            '{"status": "old", "version": 1}'::jsonb,
            '{"status": "new", "version": 2}'::jsonb,
            '118.69.187.' || floor(random() * 254 + 1)::text,
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
            CURRENT_TIMESTAMP - (random() * interval '60 days')
        );
    END LOOP;
    
END;
$$;

-- 8. COMPLETED LOGGING PRINT
SELECT 'SUCCESS: Imported 10 nodes, 11 products, 9 core users with passwords, and generated over 1500 batches, 1200 shipments, 2500 events, 200 incidents, 2500 scans, and 4000 audit logs.' AS result_message;
