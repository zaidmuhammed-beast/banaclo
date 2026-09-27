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
	<?php endif; ?>

	<form class="contact-form" method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
		<input type="hidden" name="action" value="econsco_contact">
		<?php wp_nonce_field( 'econsco_contact', 'econsco_nonce' ); ?>
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

function econsco_handle_contact() {
	$back = wp_get_referer() ? wp_get_referer() : econsco_page_url( 'contact' );
	$back = remove_query_arg( 'contact', $back );

	if ( ! isset( $_POST['econsco_nonce'] ) || ! wp_verify_nonce( sanitize_key( wp_unslash( $_POST['econsco_nonce'] ) ), 'econsco_contact' ) ) {
		wp_safe_redirect( add_query_arg( 'contact', 'failed', $back ) . '#contact-form' );
		exit;
	}

	// Bots fill the hidden field; pretend success so they move on.
	if ( ! empty( $_POST['website'] ) ) {
		wp_safe_redirect( add_query_arg( 'contact', 'sent', $back ) . '#contact-form' );
		exit;
	}

	$name    = isset( $_POST['name'] ) ? sanitize_text_field( wp_unslash( $_POST['name'] ) ) : '';
	$email   = isset( $_POST['email'] ) ? sanitize_email( wp_unslash( $_POST['email'] ) ) : '';
	$company = isset( $_POST['company'] ) ? sanitize_text_field( wp_unslash( $_POST['company'] ) ) : '';
	$service = isset( $_POST['service'] ) ? sanitize_text_field( wp_unslash( $_POST['service'] ) ) : '';
	$message = isset( $_POST['message'] ) ? sanitize_textarea_field( wp_unslash( $_POST['message'] ) ) : '';

	if ( '' === $name || ! is_email( $email ) || '' === $message ) {
		wp_safe_redirect( add_query_arg( 'contact', 'invalid', $back ) . '#contact-form' );
		exit;
	}

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
		)
	);
	$headers = array( 'Reply-To: ' . $name . ' <' . $email . '>' );

	$sent = wp_mail( econsco_opt( 'email' ), $subject, $body, $headers );

	wp_safe_redirect( add_query_arg( 'contact', $sent ? 'sent' : 'failed', $back ) . '#contact-form' );
	exit;
}
add_action( 'admin_post_nopriv_econsco_contact', 'econsco_handle_contact' );
add_action( 'admin_post_econsco_contact', 'econsco_handle_contact' );
