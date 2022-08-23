import React from "react";
import PropTypes from "prop-types";
import "./ProductCard.scss";

ProductCard.propTypes = {
	isAdmin: PropTypes.bool,
	product: PropTypes.object,
	onProductClick: PropTypes.func,
	onUpdateClick: PropTypes.func,
	onDeleteClick: PropTypes.func,
	onAddToCart: PropTypes.func,
};

ProductCard.defaultProps = {
	isAdmin: false,
	product: {},
	onProductClick: null,
	onUpdateClick: null,
	onDeleteClick: null,
	onAddToCart: null,
};

function ProductCard(props) {
	const {
		isAdmin,
		product,
		onProductClick,
		onUpdateClick,
		onDeleteClick,
		onAddToCart,
	} = props;

	const handleProductClick = () => {
		if (!onProductClick) return;

		onProductClick(product._id);
	};

	const handleAdd = () => {
		if (!onAddToCart) return;
		const productToAdd = {
			id: product._id,
			name: product.name,
			quantity: 1,
			size: product.size,
			price: product.price,
			img: product.imgList[0],
		};

		onAddToCart(productToAdd);
	};
	const handleEditClick = () => {
		if (!onUpdateClick) return;

		onUpdateClick(product._id);
	};

	const handleRemoveClick = () => {
		if (!onDeleteClick) return;

		onDeleteClick(product._id);
	};

	return (
		<li className="product-card">
			{product.name !== "fakeProduct" ? (
				<div className="product-card__inner">
					<img src={product.imgList[0]} alt="product-card-image" />
					<div className="product-card__info">
						<h6 className="product-card__name">{product.name}</h6>
						<span className="product-card__price">
							{product.price}
						</span>
					</div>

					<div className="product-card__overlay">
						<img
							src={product.imgList[1]}
							alt="product-card__overlay-image"
							onClick={handleProductClick}
						/>
						<div className="product-card__options-list">
							<ul>
								<li onClick={handleAdd}>
									<i className="e-plus" />
								</li>

								{isAdmin && (
									<>
										<li onClick={handleEditClick}>
											<i className="e-minus" />
										</li>
										<li onClick={handleRemoveClick}>
											<i className="e-x" />
										</li>
									</>
								)}
							</ul>
						</div>
					</div>
				</div>
			) : (
				<div className="product-card__inner--fake" />
			)}
		</li>
	);
}

export default ProductCard;
