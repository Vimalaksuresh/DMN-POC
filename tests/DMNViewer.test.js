// tests/DMNViewer.test.js
import { mount } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
import DMNViewer from '../src/components/DMNViewer.vue';

describe('DMNViewer', () => {
  it('renders correctly', () => {
    const wrapper = mount(DMNViewer);
    expect(wrapper.exists()).toBe(true);
  });

  it('has a create new diagram button', () => {
    const wrapper = mount(DMNViewer);
    const button = wrapper.find('.create-diagram-btn');
    expect(button.exists()).toBe(true);
  });

  it('creates a new diagram', async () => {
    const wrapper = mount(DMNViewer);
    const button = wrapper.find('.create-diagram-btn');
    await button.trigger('click');
    expect(wrapper.vm.diagramLoaded).toBe(true);
  });
});
