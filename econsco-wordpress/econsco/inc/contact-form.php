<?php
/**
 * Contact form: rendered by econsco_contact_form(), submitted to admin-post.php.
 *
 * @package econsco
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function econsco_contact_form() {
	$status = isset( $_GET['contact'] ) ? sanitize_key( wp_unslash( $_GET['contact'] ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification.Recommended
	?>
	<?php if ( 'sent' === $status ) : ?>
		<div class="notice notice--success" role="status"><?php esc_html_e( 'Thanks — your message is on its way. We will reply within one working day.', 'econsco' ); ?></div>
	<?php elseif ( 'invalid' === $status ) : ?>
		<div class="notice notice--error" role="alert"><?php esc_html_e( 'Please add your name, a valid email and a message.', 'econsco' ); ?></div>
	<?php elseif ( 'failed' === $status ) : ?>
		<div class="notice notice--error" role="alert"><?php esc_html_e( 'Sorry, the message could not be sent. Please email us directly.', 'econsco' ); ?></div>
	<?php elseif ( 'slow' === $status ) : ?>
		<div class="notice notice--error" role="alert"><?php esc_html_e( 'You have sent several messages in a short time. Please wait a few minutes and try again.', 'econsco' ); ?></div>
	<?php endif; ?>

	<form class="contact-form" method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
		<input type="hidden" name="action" value="econsco_contact">
		<div class="field field--hp" aria-hidden="true">
			<label for="ec-website"><?php esc_html_e( 'Leave this empty', 'econsco' ); ?></label>
			<input type="text" id="ec-website" name="website" tabindex="-1" autocomplete="off">
		</div>
		<div class="field-row">
			<div class="field">
				<label for="ec-name"><?php esc_html_e( 'Your name', 'econsco' ); ?></label>
				<input type="text" id="ec-name" name="name" required autocomplete="name">
			</div>
			<div class="field">
				<label for="ec-email"><?php esc_html_e( 'Email', 'econsco' ); ?></label>
				<input type="email" id="ec-email" name="email" required autocomplete="email">
			</div>
		</div>
		<div class="field-row">
			<div class="field">
				<label for="ec-company"><?php esc_html_e( 'Company (optional)', 'econsco' ); ?></label>
				<input type="text" id="ec-company" name="company" autocomplete="organization">
			</div>
			<div class="field">
				<label for="ec-service"><?php esc_html_e( 'I am interested in', 'econsco' ); ?></label>
				<select id="ec-service" name="service">
					<?php foreach ( econsco_services() as $service ) : ?>
						<option><?php echo esc_html( $service['title'] ); ?></option>
					<?php endforeach; ?>
					<option><?php esc_html_e( 'A mix of services', 'econsco' ); ?></option>
					<option><?php esc_html_e( 'Not sure yet', 'econsco' ); ?></option>
				</select>
			</div>
		</div>
		<div class="field">
			<label for="ec-message"><?php esc_html_e( 'Tell us about your goals', 'econsco' ); ?></label>
			<textarea id="ec-message" name="message" rows="5" required></textarea>
		</div>
		<button type="submit" class="btn btn--primary"><?php esc_html_e( 'Send message', 'econsco' ); ?> <?php echo econsco_icon( 'arrow' ); // phpcs:ignore WordPress.Security.EscapeOutput ?></button>
	</form>
	<?php
}

/**
 * Handles a form submission: saves it as an Enquiry, then emails it.
 *
 * The visitor sees success once the enquiry is saved, even if the email fails,
 * because it can always be read under WP Admin → Enquiries. There is no nonce:
 * page caches (e.g. LiteSpeed on Hostinger) serve expired nonces to visitors,
 * which made genuine messages fail. Spam is held back by a honeypot field,
 * a per-IP rate limit and a link-count check instead.
 */
function econsco_handle_contact() {
	$back = wp_get_referer() ? wp_get_referer() : econsco_page_url( 'contact' );
	$back = remove_query_arg( 'contact', $back );
	$done = function ( $status ) use ( $back ) {
		wp_safe_redirect( add_query_arg( 'contact', $status, $back ) . '#contact-form' );
		exit;
	};

	// Bots fill the hidden field; pretend success so they move on.
	if ( ! empty( $_POST['website'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Missing
		$done( 'sent' );
	}

	// phpcs:disable WordPress.Security.NonceVerification.Missing
	$name    = isset( $_POST['name'] ) ? sanitize_text_field( wp_unslash( $_POST['name'] ) ) : '';
	$email   = isset( $_POST['email'] ) ? sanitize_email( wp_unslash( $_POST['email'] ) ) : '';
	$company = isset( $_POST['company'] ) ? sanitize_text_field( wp_unslash( $_POST['company'] ) ) : '';
	$service = isset( $_POST['service'] ) ? sanitize_text_field( wp_unslash( $_POST['service'] ) ) : '';
	$message = isset( $_POST['message'] ) ? sanitize_textarea_field( wp_unslash( $_POST['message'] ) ) : '';
	// phpcs:enable

	if ( '' === $name || ! is_email( $email ) || '' === $message ) {
		$done( 'invalid' );
	}

	$name    = mb_substr( $name, 0, 120 );
	$company = mb_substr( $company, 0, 120 );
	$service = mb_substr( $service, 0, 80 );
	$message = mb_substr( $message, 0, 5000 );

	// Link-stuffed messages are almost always spam.
	if ( preg_match_all( '#https?://#i', $message ) > 3 ) {
		$done( 'sent' );
	}

	// At most 5 messages per visitor every 10 minutes.
	$ip       = isset( $_SERVER['REMOTE_ADDR'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ) ) : '';
	$rate_key = 'econsco_rate_' . md5( $ip );
	$count    = (int) get_transient( $rate_key );
	if ( $count >= 5 ) {
		$done( 'slow' );
	}
	set_transient( $rate_key, $count + 1, 10 * MINUTE_IN_SECONDS );

	$enquiry_id = wp_insert_post(
		array(
			'post_type'    => 'econsco_enquiry',
			'post_status'  => 'publish',
			'post_title'   => $name . ( $company ? ' — ' . $company : '' ),
			'post_content' => $message,
			'meta_input'   => array(
				'_econsco_email'   => $email,
				'_econsco_company' => $company,
				'_econsco_service' => $service,
			),
		),
		true
	);
	$saved = ! is_wp_error( $enquiry_id ) && $enquiry_id;

	$sent  = econsco_send_enquiry_email( $name, $email, $company, $service, $message, $mail_error );

	if ( $saved ) {
		update_post_meta( $enquiry_id, '_econsco_mail_status', $sent ? 'sent' : 'failed' );
		if ( ! $sent ) {
			update_post_meta( $enquiry_id, '_econsco_mail_error', $mail_error );
		}
	}

	$done( ( $saved || $sent ) ? 'sent' : 'failed' );
}
add_action( 'admin_post_nopriv_econsco_contact', 'econsco_handle_contact' );
add_action( 'admin_post_econsco_contact', 'econsco_handle_contact' );

/**
 * Emails an enquiry to the address set in the Customizer.
 *
 * When that address is on the site's own domain it is also used as the From
 * address: Hostinger (and most hosts) reject mail "from" a mailbox that does
 * not exist, such as WordPress's default wordpress@domain. An SMTP plugin's
 * settings take precedence over this.
 *
 * @param string $error Set to the mailer's error message when sending fails.
 */
function econsco_send_enquiry_email( $name, $email, $company, $service, $message, &$error = '' ) {
	$to      = econsco_opt( 'email' );
	$subject = sprintf(
		/* translators: 1: sender name, 2: site name */
		__( 'New enquiry from %1$s via %2$s', 'econsco' ),
		$name,
		wp_specialchars_decode( get_bloginfo( 'name' ), ENT_QUOTES )
	);
	$body = implode(
		"\n",
		array(
			__( 'Name:', 'econsco' ) . ' ' . $name,
			__( 'Email:', 'econsco' ) . ' ' . $email,
			__( 'Company:', 'econsco' ) . ' ' . $company,
			__( 'Interested in:', 'econsco' ) . ' ' . $service,
			'',
			$message,
			'',
			'—',
			__( 'Also saved in WP Admin → Enquiries.', 'econsco' ),
		)
	);
	$headers = array( 'Reply-To: ' . $name . ' <' . $email . '>' );

	$site_domain = preg_replace( '/^www\./', '', (string) wp_parse_url( home_url(), PHP_URL_HOST ) );
	$to_domain   = strtolower( substr( strrchr( $to, '@' ), 1 ) );
	if ( $site_domain && $to_domain === strtolower( $site_domain ) ) {
		$headers[] = 'From: ' . wp_specialchars_decode( get_bloginfo( 'name' ), ENT_QUOTES ) . ' Website <' . $to . '>';
	}

	$error   = '';
	$catcher = function ( $wp_error ) use ( &$error ) {
		$error = $wp_error->get_error_message();
	};
	add_action( 'wp_mail_failed', $catcher );
	$sent = wp_mail( $to, $subject, $body, $headers );
	remove_action( 'wp_mail_failed', $catcher );

	return (bool) $sent;
}
