import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import FilterSearch from './FilterSearch';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'ReactFilterSearchBox/FilterSearch',
  component: FilterSearch,
} as ComponentMeta<typeof FilterSearch>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof FilterSearch> = (args: any) => (
  <FilterSearch {...args} />
);

export const HelloWorld = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
HelloWorld.args = {
  selectors: {
    firstName: ['John', 'Jane', 'Alice', 'Bob'],
    lastName: ['Doe', 'Smith', 'Johnson', 'Brown'],
    address: [
      '26131 Elian Burgs',
      '507 Greenholt Freeway',
      '132 Blanda Highway',
      '772 Kelsie Bridge Apt. 726',
      '29387 Alicia Brooks Suite 615',
    ],
  },
};
