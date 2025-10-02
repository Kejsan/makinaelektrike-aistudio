import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { Dealer, Model, BlogPost } from '../types';

type DealerInput = Omit<Dealer, 'id'>;
type ModelInput = Omit<Model, 'id'>;
type BlogPostInput = Omit<BlogPost, 'id'>;

const flushTimers = () => vi.runAllTimersAsync();

describe('services/api mutable store', () => {
  beforeEach(async () => {
    vi.useFakeTimers();
    const api = await import('./api');
    api.resetDataStore();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.resetModules();
  });

  it('persists newly created dealers across module reloads', async () => {
    const api = await import('./api');

    const dealerInput: DealerInput = {
      name: 'Test Dealer',
      address: '123 Electric Ave',
      city: 'Tirana',
      lat: 41.0,
      lng: 19.0,
      phone: '+355 00 000 000',
      email: 'dealer@example.com',
      website: 'https://dealer.example.com',
      social_links: { instagram: '@dealer' },
      brands: ['Test Brand'],
      languages: ['Albanian'],
      notes: 'Open for tests',
      typeOfCars: 'New',
      priceRange: '€10,000 - €20,000',
      modelsAvailable: ['Model A'],
      image_url: 'https://picsum.photos/seed/dealer-test/400/300',
      isFeatured: false,
    };

    const createPromise = api.createDealer(dealerInput);
    await flushTimers();
    const createdDealer = await createPromise;

    const dealersPromise = api.getDealers();
    await flushTimers();
    const dealers = await dealersPromise;
    expect(dealers.some(dealer => dealer.id === createdDealer.id)).toBe(true);

    vi.resetModules();
    const reloadedApi = await import('./api');
    vi.useFakeTimers();

    const reloadedDealersPromise = reloadedApi.getDealers();
    await flushTimers();
    const reloadedDealers = await reloadedDealersPromise;
    expect(reloadedDealers.some(dealer => dealer.id === createdDealer.id)).toBe(true);
  });

  it('updates model data consistently', async () => {
    const api = await import('./api');

    const modelInput: ModelInput = {
      brand: 'Integration',
      model_name: 'Model Persist',
      body_type: 'Hatchback',
      battery_capacity: 55,
      range_wltp: 400,
      power_kw: 120,
      torque_nm: 300,
      acceleration_0_100: 6.5,
      top_speed: 180,
      drive_type: 'FWD',
      seats: 5,
      charging_ac: '11 kW',
      charging_dc: '120 kW',
      image_url: 'https://picsum.photos/seed/model-test/400/300',
      isFeatured: false,
    };

    const createPromise = api.createModel(modelInput);
    await flushTimers();
    const createdModel = await createPromise;

    const updatePromise = api.updateModel(createdModel.id, { range_wltp: 450, notes: 'Updated' });
    await flushTimers();
    const updatedModel = await updatePromise;

    expect(updatedModel.range_wltp).toBe(450);
    expect(updatedModel.notes).toBe('Updated');

    const modelsPromise = api.getModels();
    await flushTimers();
    const models = await modelsPromise;
    const storedModel = models.find(model => model.id === createdModel.id);
    expect(storedModel?.range_wltp).toBe(450);
    expect(storedModel?.notes).toBe('Updated');
  });

  it('deletes blog posts and keeps store in sync', async () => {
    const api = await import('./api');

    const postInput: BlogPostInput = {
      title: 'Testing Persistence',
      excerpt: 'An integration test blog post',
      author: 'QA Bot',
      date: '2025-01-01',
      imageUrl: 'https://picsum.photos/seed/blog-test/400/300',
    };

    const createPromise = api.createBlogPost(postInput);
    await flushTimers();
    const createdPost = await createPromise;

    const deletePromise = api.deleteBlogPost(createdPost.id);
    await flushTimers();
    await deletePromise;

    const postsPromise = api.getBlogPosts();
    await flushTimers();
    const posts = await postsPromise;
    expect(posts.some(post => post.id === createdPost.id)).toBe(false);
  });
});
