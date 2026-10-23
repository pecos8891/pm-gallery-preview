-- Выполнить в Supabase SQL Editor для тестового сайта PM.
-- Добавляет необязательное название коллекции каждой работе.
-- Существующие работы сохраняются без изменений.
alter table public.artworks add column if not exists collection text not null default '';
create index if not exists artworks_category_collection_idx on public.artworks (category, collection);
