-- Remove the legacy 收藏 status from existing application records.
-- Run this once after 0003_allow_custom_application_fields.sql if your database has old 收藏 rows.

update public.applications
set status = '准备投递'
where status = '收藏';