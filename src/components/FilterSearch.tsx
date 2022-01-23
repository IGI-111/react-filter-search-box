import React from 'react';

export interface FilterSearchProps {
  label: string;
}

const FilterSearch = (props: FilterSearchProps) => {
  return <button>{props.label}</button>;
};

export default FilterSearch;
