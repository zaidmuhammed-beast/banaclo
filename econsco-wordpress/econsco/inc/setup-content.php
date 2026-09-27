<?php
/**
 * One-time site setup on theme activation: creates the pages, sets the static
 * front page and blog page, and builds the main menu. Existing pages, menus and
 * reading settings are left alone.
 *
 * @package econsco
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function econsco_setup_site() {
	$ids = array();
	foreach ( econsco_pages() as $slug => $page ) {
		$existing = get_page_by_path( $slug );
		if ( $existing ) {
			$ids[ $slug ] = $existing->ID;
			continue;
		}
		$ids[ $slug ] = wp_insert_post(
			array(
				'post_type'   => 'page',
				'post_status' => 'publish',
				'post_title'  => $page['title'],
				'post_name'   => $slug,
			)
		);
	}

	if ( 'posts' === get_option( 'show_on_front' ) && ! empty( $ids['home'] ) ) {
		update_option( 'show_on_front', 'page' );
		update_option( 'page_on_front', $ids['home'] );
		update_option( 'page_for_posts', $ids['blog'] );
	}

	if ( ! term_exists( 'case-studies', 'category' ) ) {
		wp_insert_term( __( 'Case Studies', 'econsco' ), 'category', array( 'slug' => 'case-studies' ) );
	}

	$locations = get_theme_mod( 'nav_menu_locations', array() );
	if ( empty( $locations['primary'] ) ) {
		$menu_id = wp_create_nav_menu( __( 'Main menu', 'econsco' ) );
		if ( ! is_wp_error( $menu_id ) ) {
			foreach ( econsco_pages() as $slug => $page ) {
				if ( ! $page['in_menu'] || empty( $ids[ $slug ] ) ) {
					continue;
				}
				wp_update_nav_menu_item(
					$menu_id,
					0,
					array(
						'menu-item-object-id' => $ids[ $slug ],
						'menu-item-object'    => 'page',
						'menu-item-type'      => 'post_type',
						'menu-item-status'    => 'publish',
					)
				);
			}
			$locations['primary'] = $menu_id;
			set_theme_mod( 'nav_menu_locations', $locations );
		}
	}

	// Pretty permalinks so /services/, /contact/ etc. work.
	if ( '' === get_option( 'permalink_structure' ) ) {
		update_option( 'permalink_structure', '/%postname%/' );
	}
	flush_rewrite_rules();
}
add_action( 'after_switch_theme', 'econsco_setup_site' );
