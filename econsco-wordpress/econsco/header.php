<?php
/**
 * Site header.
 *
 * @package econsco
 */
?><!doctype html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<meta name="theme-color" content="#0b2238">
	<script>document.documentElement.classList.add('js');</script>
	<?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>
<a class="skip-link" href="#main"><?php esc_html_e( 'Skip to content', 'econsco' ); ?></a>

<div class="bg-decor" aria-hidden="true">
	<span class="glow glow--lime"></span>
	<span class="glow glow--teal"></span>
	<svg class="outline outline--star" viewBox="0 0 200 200"><circle cx="100" cy="100" r="90"/><circle cx="100" cy="100" r="62"/><path d="M100 48l14 30 32 4-24 22 6 32-28-16-28 16 6-32-24-22 32-4z"/></svg>
	<svg class="outline outline--arrow" viewBox="0 0 200 200"><circle cx="100" cy="100" r="90"/><circle cx="100" cy="100" r="62"/><path d="M70 130l60-60M90 70h40v40"/></svg>
</div>

<header class="site-header" id="top">
	<div class="container site-header__inner glass">
		<?php get_template_part( 'template-parts/logo' ); ?>

		<button class="nav-toggle" aria-expanded="false" aria-controls="site-nav">
			<span class="screen-reader-text"><?php esc_html_e( 'Menu', 'econsco' ); ?></span>
			<?php echo econsco_icon( 'menu' ); // phpcs:ignore WordPress.Security.EscapeOutput ?>
			<?php echo econsco_icon( 'close' ); // phpcs:ignore WordPress.Security.EscapeOutput ?>
		</button>

		<nav class="site-nav" id="site-nav" aria-label="<?php esc_attr_e( 'Main', 'econsco' ); ?>">
			<?php
			wp_nav_menu(
				array(
					'theme_location' => 'primary',
					'container'      => false,
					'menu_class'     => 'menu',
					'depth'          => 2,
					'fallback_cb'    => 'econsco_nav_fallback',
				)
			);
			?>
			<a class="btn btn--primary btn--sm" href="<?php echo esc_url( econsco_page_url( 'contact' ) ); ?>"><?php esc_html_e( 'Get a proposal', 'econsco' ); ?></a>
		</nav>
	</div>
</header>

<main id="main" class="site-main">
