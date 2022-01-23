import React from 'react';
import "./FilterSearch.scss"

export interface FilterSearchProps {
  label: string;
}

const FilterSearch = (props: FilterSearchProps) => {
  return <button>{props.label}</button>;
};

export default FilterSearch;
