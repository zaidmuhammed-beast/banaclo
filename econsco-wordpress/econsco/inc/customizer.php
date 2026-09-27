<?php
/**
 * Customizer settings: Appearance → Customize → ECONSCO.
 *
 * @package econsco
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function econsco_option_defaults() {
	return array(
		'hero_title'   => __( 'Scale your business with content, ads and websites that work together.', 'econsco' ),
		'hero_text'    => __( 'ECONSCO is a modern digital firm. We plan, create and run the content marketing, advertising and websites that turn attention into customers — so you can focus on growing.', 'econsco' ),
		'cta_title'    => __( 'Ready to grow?', 'econsco' ),
		'cta_text'     => __( 'Tell us where you want your business to be. We will come back within one working day with ideas and a clear plan.', 'econsco' ),
		'email'        => 'admin@econsco.com',
		'phone'        => '',
		'whatsapp'     => '',
		'address'      => '',
		'hours'        => __( 'Mon – Fri, 9:00 – 18:00', 'econsco' ),
		'instagram'    => '',
		'linkedin'     => '',
		'facebook'     => '',
		'footer_about' => __( 'A modern digital firm helping businesses scale through content marketing, advertising and website development.', 'econsco' ),
	);
}

/**
 * Reads a theme option; empty email falls back to the site admin email.
 */
function econsco_opt( $key ) {
	$defaults = econsco_option_defaults();
	$value    = get_theme_mod( 'econsco_' . $key, isset( $defaults[ $key ] ) ? $defaults[ $key ] : '' );
	if ( 'email' === $key && '' === $value ) {
		$value = get_option( 'admin_email' );
	}
	return $value;
}

function econsco_customize_register( $wp_customize ) {
	$wp_customize->add_panel(
		'econsco',
		array(
			'title'    => __( 'ECONSCO', 'econsco' ),
			'priority' => 30,
		)
	);

	$sections = array(
		'econsco_home'    => array(
			'title'  => __( 'Homepage', 'econsco' ),
			'fields' => array(
				'hero_title' => array( __( 'Hero headline', 'econsco' ), 'textarea' ),
				'hero_text'  => array( __( 'Hero text', 'econsco' ), 'textarea' ),
				'cta_title'  => array( __( 'Call-to-action headline', 'econsco' ), 'text' ),
				'cta_text'   => array( __( 'Call-to-action text', 'econsco' ), 'textarea' ),
			),
		),
		'econsco_contact' => array(
			'title'  => __( 'Contact details', 'econsco' ),
			'fields' => array(
				'email'    => array( __( 'Email (form messages go here; blank = admin email)', 'econsco' ), 'email' ),
				'phone'    => array( __( 'Phone', 'econsco' ), 'text' ),
				'whatsapp' => array( __( 'WhatsApp number (international format, e.g. 923001234567)', 'econsco' ), 'text' ),
				'address'  => array( __( 'Address', 'econsco' ), 'textarea' ),
				'hours'    => array( __( 'Opening hours', 'econsco' ), 'text' ),
			),
		),
		'econsco_social'  => array(
			'title'  => __( 'Social & footer', 'econsco' ),
			'fields' => array(
				'instagram'    => array( __( 'Instagram URL', 'econsco' ), 'url' ),
				'linkedin'     => array( __( 'LinkedIn URL', 'econsco' ), 'url' ),
				'facebook'     => array( __( 'Facebook URL', 'econsco' ), 'url' ),
				'footer_about' => array( __( 'Footer description', 'econsco' ), 'textarea' ),
			),
		),
	);

	$defaults = econsco_option_defaults();
	foreach ( $sections as $section_id => $section ) {
		$wp_customize->add_section(
			$section_id,
			array(
				'title' => $section['title'],
				'panel' => 'econsco',
			)
		);
		foreach ( $section['fields'] as $key => $field ) {
			list( $label, $type ) = $field;
			$sanitize             = 'sanitize_text_field';
			if ( 'textarea' === $type ) {
				$sanitize = 'sanitize_textarea_field';
			} elseif ( 'email' === $type ) {
				$sanitize = 'sanitize_email';
			} elseif ( 'url' === $type ) {
				$sanitize = 'esc_url_raw';
			}
			$wp_customize->add_setting(
				'econsco_' . $key,
				array(
					'default'           => $defaults[ $key ],
					'sanitize_callback' => $sanitize,
				)
			);
			$wp_customize->add_control(
				'econsco_' . $key,
				array(
					'label'   => $label,
					'section' => $section_id,
					'type'    => $type,
				)
			);
		}
	}
}
add_action( 'customize_register', 'econsco_customize_register' );
