import React, { useState, Fragment } from 'react';
import './FilterSearch.scss';
import Fuse from 'fuse.js';

type Selectors = { [key: string]: string[] };

export interface FilterSearchProps {
  selectors: Selectors;
  searchbox: (props: SearchboxProps) => React.Component | undefined;
  dropdown: (props: DropdownProps) => React.Component | undefined;
  onSearch:
    | ((
        rawSearch: string,
        filters: Array<{ key: string; value: string }>
      ) => void)
    | undefined;
}

const FilterSearch = (props: FilterSearchProps) => {
  const searchbox = props.searchbox || ((props) => <Searchbox {...props} />);
  const dropdown = props.dropdown || ((props) => <Dropdown {...props} />);

  const [filterTags, setFilterTags] = useState(
    (): Array<{ key: string; value: string }> => []
  );
  const [currentSearch, setCurrentSearch] = useState('');
  const [filterToSet, rawSetFilterToSet] = useState((): string | null => null);

  let inputRef: React.MutableRefObject<HTMLInputElement | undefined> =
    React.useRef();

  const deleteFilterTag = (key: string) => {
    setFilterTags((old) => [
      ...old.filter((filterTag) => filterTag.key !== key),
    ]);
  };

  const popLastFilterTag = (): { key: string; value: string } => {
    let last = filterTags[filterTags.length - 1];
    setFilterTags((old) => {
      return old.slice(0, -1);
    });
    return last;
  };

  const setFilterTag = (key: string, value: string) => {
    setFilterTags((old) => [
      ...old.filter((filterTag) => filterTag.key !== key),
      { key, value },
    ]);
    setFilterToSet(null);
  };

  const setFilterToSet = (tag: string | null) => {
    rawSetFilterToSet(tag);
    setCurrentSearch('');
    if (inputRef.current !== undefined) {
      inputRef.current.focus();
    }
  };

  const handleSearchBoxChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const val = evt.target.value || '';
    if (
      filterToSet === null &&
      val[val.length - 1] === ':' &&
      Object.keys(props.selectors).includes(val.slice(0, val.length - 1))
    ) {
      setFilterToSet(val.slice(0, val.length - 1));
    } else {
      setCurrentSearch(evt.target.value || '');
    }
  };

  const handleSearchBoxSubmit = (rawSearch: string) => {
    if (
      filterToSet !== null &&
      props.selectors[filterToSet].includes(rawSearch)
    ) {
      setFilterTag(filterToSet, rawSearch);
    } else if (props.onSearch !== undefined) {
      props.onSearch(rawSearch, filterTags);
    }
  };

  const handleBackspace = () => {
    if (filterToSet !== null) {
      setFilterToSet(null);
    } else if (filterTags.length > 0) {
      const { key, value } = popLastFilterTag();
      setFilterToSet(key);
      setCurrentSearch(value);
    }
  };

  const searchSelectors = (search: string) => {
    let selectors = props.selectors;
    if (filterToSet !== null) {
      selectors = filterObject(selectors, (k: string) => k === filterToSet);
    }

    if (search === '') {
      return Object.keys(selectors).reduce((acc: Selectors, k) => {
        acc[k] = [];
        return acc;
      }, {});
    }

    // search values
    const fuse = new Fuse(Object.values(selectors).flat(), {});
    const foundValues = new Set(fuse.search(search).map((r) => r.item));

    return (
      Object.entries(selectors)
        .map(([key, values]: [string, string[]]): [string, string[]] => [
          key,
          values.filter((v) => foundValues.has(v)),
        ])
        // .filter(([_, values]) => values.length > 0)
        .reduce((acc: Selectors, [key, values]: [string, string[]]) => {
          acc[key] = values;
          return acc;
        }, {})
    );
  };

  const searchedSelectors: Selectors = searchSelectors(currentSearch);

  return (
    <span className="filter-search">
      <div className="filter-search-box block">
        {searchbox({
          currentSearch: currentSearch,
          onChange: handleSearchBoxChange,
          onDeleteFilterTag: deleteFilterTag,
          onSubmit: handleSearchBoxSubmit,
          onSetFilterToSet: setFilterToSet,
          onBackspace: handleBackspace,
          filterToSet: filterToSet,
          filterTags: filterTags,
          inputRef: (ref) => {
            inputRef.current = ref;
          },
        })}
      </div>
      <div className="filter-search-dropdown block">
        {dropdown({
          selectors: searchedSelectors,
          onSelect: setFilterTag,
          onSetFilterToSet: setFilterToSet,
          filterToSet: filterToSet,
        })}
      </div>
    </span>
  );
};

interface SearchboxProps {
  currentSearch: string;
  onChange: (evt: React.ChangeEvent<HTMLInputElement>) => void;
  onDeleteFilterTag: (key: string) => void;
  onSubmit: (rawSearch: string) => void;
  onSetFilterToSet: (tag: string | null) => void;
  onBackspace: () => void;
  filterToSet: string | null;
  filterTags: Array<{ key: string; value: string }>;
  inputRef: (ref: HTMLInputElement) => void;
}

const Searchbox = (props: SearchboxProps) => {
  return (
    <div className="control">
      <div className="tags-input input">
        {props.filterTags.map(({ key, value }) => (
          <span className="tag">
            {key}: {value}
            <div
              className="delete is-small"
              onClick={() => props.onDeleteFilterTag(key)}
            />
          </span>
        ))}
        {props.filterToSet !== null && (
          <span className="tag">
            {props.filterToSet}:
            <div
              className="delete is-small"
              onClick={() => props.onSetFilterToSet(null)}
            />
          </span>
        )}
        <input
          ref={props.inputRef}
          className="input"
          type="text"
          value={props.currentSearch}
          onChange={props.onChange}
          onKeyDown={(evt: React.KeyboardEvent) => {
            if (evt.key === 'Enter') {
              props.onSubmit(props.currentSearch);
              evt.preventDefault();
            } else if (
              evt.key === 'Backspace' &&
              props.currentSearch.length === 0
            ) {
              props.onBackspace();
              evt.preventDefault();
            }
          }}
        />
      </div>
    </div>
  );
};
// <div className="control">
//   <a
//     className="button"
//     onClick={() => props.onSubmit(props.currentSearch)}
//   >
//     Search
//   </a>
// </div>

interface DropdownProps {
  selectors: Selectors;
  onSelect: (key: string, value: string) => void;
  onSetFilterToSet: (tag: string | null) => void;
  filterToSet: string | null;
}

const Dropdown = (props: DropdownProps) => {
  const valueSearches = Object.entries(props.selectors);
  return (
    <div>
      {valueSearches.length > 0 && (
        <div className="buttons">
          {valueSearches.map(([key, values]) => (
            <Fragment key={key}>
              {values.map((value: string) => (
                <a
                  className="button"
                  key={value}
                  onClick={() => props.onSelect(key, value)}
                >
                  {key}:<strong>{value}</strong>
                </a>
              ))}
            </Fragment>
          ))}
        </div>
      )}
      <div className="buttons">
        {Object.entries(props.selectors).map(([key, _]) => (
          <Fragment key={key}>
            {props.filterToSet !== null || (
              <a className="button" onClick={() => props.onSetFilterToSet(key)}>
                <strong>{key}</strong>: ?
              </a>
            )}
          </Fragment>
        ))}
      </div>
    </div>
  );
};

const filterObject = (
  obj: { [key: string]: any },
  pred: (key: string) => boolean
): { [key: string]: any } => {
  return Object.keys(obj)
    .filter(pred)
    .reduce((acc: { [key: string]: any }, k) => {
      acc[k] = obj[k];
      return acc;
    }, {});
};

export default FilterSearch;
