-- seed.sql (example)
INSERT INTO public.bundles (id, network, size, price_agent, price_customer) VALUES
('mtn-1gb', 'MTN', '1GB', 4.20, 5.00),
('mtn-2gb', 'MTN', '2GB', 8.20, 10.00),
('tigo-1gb', 'TIGO', '1GB', 3.84, 4.80)
ON CONFLICT (id) DO NOTHING;
