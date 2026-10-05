<?php
/**
 * "Enquiries" admin screen: every contact form submission, kept even when the
 * notification email could not be sent.
 *
 * @package econsco
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function econsco_register_enquiries() {
	register_post_type(
		'econsco_enquiry',
		array(
			'labels'          => array(
				'name'          => __( 'Enquiries', 'econsco' ),
				'singular_name' => __( 'Enquiry', 'econsco' ),
				'all_items'     => __( 'All enquiries', 'econsco' ),
				'edit_item'     => __( 'Enquiry', 'econsco' ),
				'search_items'  => __( 'Search enquiries', 'econsco' ),
				'not_found'     => __( 'No enquiries yet.', 'econsco' ),
			),
			'public'          => false,
			'show_ui'         => true,
			'show_in_menu'    => true,
			'menu_position'   => 25,
			'menu_icon'       => 'dashicons-email-alt',
			'supports'        => array( 'title' ),
			'capability_type' => 'post',
			'capabilities'    => array( 'create_posts' => 'do_not_allow' ),
			'map_meta_cap'    => true,
		)
	);
}
add_action( 'init', 'econsco_register_enquiries' );

function econsco_enquiry_columns( $columns ) {
	return array(
		'cb'      => $columns['cb'],
		'title'   => __( 'From', 'econsco' ),
		'email'   => __( 'Email', 'econsco' ),
		'service' => __( 'Interested in', 'econsco' ),
		'mail'    => __( 'Email notification', 'econsco' ),
		'date'    => __( 'Received', 'econsco' ),
	);
}
add_filter( 'manage_econsco_enquiry_posts_columns', 'econsco_enquiry_columns' );

function econsco_enquiry_column( $column, $post_id ) {
	if ( 'email' === $column ) {
		$email = get_post_meta( $post_id, '_econsco_email', true );
		printf( '<a href="mailto:%1$s">%1$s</a>', esc_attr( $email ) );
	} elseif ( 'service' === $column ) {
		echo esc_html( get_post_meta( $post_id, '_econsco_service', true ) );
	} elseif ( 'mail' === $column ) {
		$status = get_post_meta( $post_id, '_econsco_mail_status', true );
		if ( 'sent' === $status ) {
			echo '<span style="color:#008a20;">&#10003; ' . esc_html__( 'Sent', 'econsco' ) . '</span>';
		} else {
			echo '<span style="color:#d63638;">&#10007; ' . esc_html__( 'Not sent', 'econsco' ) . '</span>';
		}
	}
}
add_action( 'manage_econsco_enquiry_posts_custom_column', 'econsco_enquiry_column', 10, 2 );

function econsco_enquiry_meta_box() {
	add_meta_box( 'econsco_enquiry_details', __( 'Message', 'econsco' ), 'econsco_enquiry_details', 'econsco_enquiry', 'normal', 'high' );
	remove_meta_box( 'submitdiv', 'econsco_enquiry', 'side' );
}
add_action( 'add_meta_boxes_econsco_enquiry', 'econsco_enquiry_meta_box' );

function econsco_enquiry_details( $post ) {
	$email   = get_post_meta( $post->ID, '_econsco_email', true );
	$rows    = array(
		__( 'Email', 'econsco' )         => '<a href="mailto:' . esc_attr( $email ) . '">' . esc_html( $email ) . '</a>',
		__( 'Company', 'econsco' )       => esc_html( get_post_meta( $post->ID, '_econsco_company', true ) ),
		__( 'Interested in', 'econsco' ) => esc_html( get_post_meta( $post->ID, '_econsco_service', true ) ),
		__( 'Received', 'econsco' )      => esc_html( get_the_date( '', $post ) . ' ' . get_the_time( '', $post ) ),
	);
	echo '<table class="form-table" role="presentation"><tbody>';
	foreach ( $rows as $label => $value ) {
		printf( '<tr><th scope="row">%s</th><td>%s</td></tr>', esc_html( $label ), $value ); // phpcs:ignore WordPress.Security.EscapeOutput
	}
	echo '</tbody></table>';
	echo '<div style="margin-top:12px;padding:16px;background:#f6f7f7;border-radius:4px;white-space:pre-wrap;">' . esc_html( $post->post_content ) . '</div>';
	printf(
		'<p><a class="button button-primary" href="mailto:%s?subject=%s">%s</a></p>',
		esc_attr( $email ),
		rawurlencode( __( 'Re: your enquiry to ECONSCO', 'econsco' ) ),
		esc_html__( 'Reply by email', 'econsco' )
	);
	if ( 'failed' === get_post_meta( $post->ID, '_econsco_mail_status', true ) ) {
		$error = get_post_meta( $post->ID, '_econsco_mail_error', true );
		echo '<div class="notice notice-warning inline"><p>' . esc_html__( 'The notification email for this enquiry could not be sent. Set up an SMTP plugin (e.g. WP Mail SMTP) so future enquiries reach your inbox.', 'econsco' );
		if ( $error ) {
			echo '<br><code>' . esc_html( $error ) . '</code>';
		}
		echo '</p></div>';
	}
}
