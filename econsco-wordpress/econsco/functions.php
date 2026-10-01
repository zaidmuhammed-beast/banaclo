<?php
/**
 * ECONSCO theme bootstrap.
 *
 * @package econsco
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'ECONSCO_VERSION', '1.0.0' );

require get_template_directory() . '/inc/content.php';
require get_template_directory() . '/inc/icons.php';
require get_template_directory() . '/inc/customizer.php';
require get_template_directory() . '/inc/contact-form.php';
require get_template_directory() . '/inc/setup-content.php';

function econsco_setup() {
	load_theme_textdomain( 'econsco', get_template_directory() . '/languages' );

	add_theme_support( 'title-tag' );
	add_theme_support( 'automatic-feed-links' );
	add_theme_support( 'post-thumbnails' );
	add_theme_support( 'responsive-embeds' );
	add_theme_support( 'align-wide' );
	add_theme_support( 'html5', array( 'search-form', 'comment-form', 'comment-list', 'gallery', 'caption', 'style', 'script' ) );
	add_theme_support(
		'custom-logo',
		array(
			'height'      => 80,
			'width'       => 240,
			'flex-height' => true,
			'flex-width'  => true,
		)
	);

	register_nav_menus(
		array(
			'primary' => __( 'Main menu', 'econsco' ),
			'footer'  => __( 'Footer menu', 'econsco' ),
		)
	);
}
add_action( 'after_setup_theme', 'econsco_setup' );

function econsco_assets() {
	wp_enqueue_style(
		'econsco-fonts',
		'https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700&family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600&display=swap',
		array(),
		null
	);
	wp_enqueue_style( 'econsco-main', get_template_directory_uri() . '/assets/css/main.css', array(), ECONSCO_VERSION );
	wp_enqueue_script( 'econsco-main', get_template_directory_uri() . '/assets/js/main.js', array(), ECONSCO_VERSION, array( 'strategy' => 'defer', 'in_footer' => true ) );

	if ( is_singular() && comments_open() && get_option( 'thread_comments' ) ) {
		wp_enqueue_script( 'comment-reply' );
	}
}
add_action( 'wp_enqueue_scripts', 'econsco_assets' );

function econsco_resource_hints( $urls, $relation ) {
	if ( 'preconnect' === $relation ) {
		$urls[] = 'https://fonts.googleapis.com';
		$urls[] = array(
			'href' => 'https://fonts.gstatic.com',
			'crossorigin',
		);
	}
	return $urls;
}
add_filter( 'wp_resource_hints', 'econsco_resource_hints', 10, 2 );

/**
 * Menu shown until a menu is assigned to a location: links to the theme's pages.
 */
function econsco_nav_fallback( $args = array() ) {
	$class = isset( $args['menu_class'] ) ? $args['menu_class'] : 'menu';
	echo '<ul class="' . esc_attr( $class ) . '">';
	foreach ( econsco_pages() as $slug => $page ) {
		if ( ! $page['in_menu'] ) {
			continue;
		}
		$url = 'home' === $slug ? home_url( '/' ) : econsco_page_url( $slug );
		printf( '<li><a href="%s">%s</a></li>', esc_url( $url ), esc_html( $page['title'] ) );
	}
	echo '</ul>';
}

/**
 * URL of one of the theme's pages by slug, falling back to a pretty path.
 */
function econsco_page_url( $slug ) {
	$page = get_page_by_path( $slug );
	return $page ? get_permalink( $page ) : home_url( '/' . $slug . '/' );
}

/**
 * Browser-tab and home-screen icons, used until a Site Icon is set in the Customizer.
 */
function econsco_fallback_icons() {
	if ( has_site_icon() ) {
		return;
	}
	$dir = get_template_directory_uri() . '/assets/img/';
	printf( '<link rel="icon" href="%s" type="image/svg+xml">' . "\n", esc_url( $dir . 'mark.svg' ) );
	printf( '<link rel="icon" href="%s" sizes="32x32">' . "\n", esc_url( $dir . 'icon-32.png' ) );
	printf( '<link rel="apple-touch-icon" href="%s">' . "\n", esc_url( $dir . 'icon-180.png' ) );
}
add_action( 'wp_head', 'econsco_fallback_icons' );

function econsco_excerpt_length() {
	return 24;
}
add_filter( 'excerpt_length', 'econsco_excerpt_length' );

function econsco_excerpt_more() {
	return '&hellip;';
}
add_filter( 'excerpt_more', 'econsco_excerpt_more' );

/**
 * Page hero used by inner pages.
 */
function econsco_page_hero( $eyebrow, $title, $lead = '' ) {
	?>
	<section class="page-hero">
		<div class="container">
			<?php if ( $eyebrow ) : ?>
				<p class="eyebrow"><?php echo esc_html( $eyebrow ); ?></p>
			<?php endif; ?>
			<h1 class="page-hero__title"><?php echo esc_html( $title ); ?></h1>
			<?php if ( $lead ) : ?>
				<p class="page-hero__lead"><?php echo esc_html( $lead ); ?></p>
			<?php endif; ?>
		</div>
	</section>
	<?php
}

/**
 * Prints the page's own editor content, if any, below the designed sections.
 */
function econsco_page_editor_content() {
	while ( have_posts() ) {
		the_post();
		if ( '' !== trim( get_the_content() ) ) {
			echo '<section class="section"><div class="container prose">';
			the_content();
			echo '</div></section>';
		}
	}
}
