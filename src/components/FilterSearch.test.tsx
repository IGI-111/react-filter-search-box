import React from "react";
import { render } from "@testing-library/react";

import FilterSearch from "./FilterSearch";

describe("FilterSearch", () => {
  test("renders the FilterSearch component", () => {
    render(<FilterSearch label="Hello world!" />);
  });
});
