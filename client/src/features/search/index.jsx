import React, { useRef } from "react";
import "./Search.scss";
import SearchList from "./components/SearchList";
import SearchForm from "./components/SearchForm";

function Search(props) {
	const { searchs, isSearchPanelOpen, onSearchClick, onSearchChange } = props;
	const inputElement = useRef(null);
	const searchPanelClassName = !isSearchPanelOpen
		? "search__panel"
		: "search__panel search__panel--open";

	const handleToggleClick = () => {
		if (inputElement) {
			inputElement.current.focus();
		}

		if (isSearchPanelOpen) return;

		onSearchClick();
	};

	const handleCloseToggleClick = () => {
		onSearchClick();
	};

	return (
		<div className="search">
			<div className="search__content">
				<div className="search__toggle" onClick={handleToggleClick}>
					<i className="e-search" />
				</div>

				<SearchForm
					inputElement={inputElement}
					onInputClick={handleToggleClick}
					onSubmit={onSearchChange}
					refElement={inputElement}
				/>
				{isSearchPanelOpen && (
					<div
						className="search__close-toggle"
						onClick={handleCloseToggleClick}
					>
						<i className="e-x" style={{ width: "20px" }} />
					</div>
				)}
			</div>

			<section className={searchPanelClassName}>
				<div className="search__panel__inner">
					<SearchList list={searchs} />
				</div>
			</section>
		</div>
	);
}

export default Search;
