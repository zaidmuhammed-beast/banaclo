<?php
/**
 * Contact page (slug: contact).
 *
 * @package econsco
 */

get_header();
econsco_page_hero(
	__( 'Contact', 'econsco' ),
	__( 'Let’s talk about your growth.', 'econsco' ),
	__( 'Share a little about your business and goals. We reply within one working day.', 'econsco' )
);
?>

<section class="section section--tight">
	<div class="container contact">
		<div class="contact__form glass glass--strong" id="contact-form">
			<?php econsco_contact_form(); ?>
		</div>

		<aside class="contact__info">
			<div class="info-card glass">
				<span class="icon-badge"><?php echo econsco_icon( 'mail' ); // phpcs:ignore WordPress.Security.EscapeOutput ?></span>
				<div>
					<h2 class="info-card__title"><?php esc_html_e( 'Email', 'econsco' ); ?></h2>
					<a href="mailto:<?php echo esc_attr( antispambot( econsco_opt( 'email' ) ) ); ?>"><?php echo esc_html( antispambot( econsco_opt( 'email' ) ) ); ?></a>
				</div>
			</div>
			<?php if ( econsco_opt( 'phone' ) ) : ?>
				<div class="info-card glass">
					<span class="icon-badge"><?php echo econsco_icon( 'phone' ); // phpcs:ignore WordPress.Security.EscapeOutput ?></span>
					<div>
						<h2 class="info-card__title"><?php esc_html_e( 'Phone', 'econsco' ); ?></h2>
						<a href="tel:<?php echo esc_attr( preg_replace( '/[^0-9+]/', '', econsco_opt( 'phone' ) ) ); ?>"><?php echo esc_html( econsco_opt( 'phone' ) ); ?></a>
					</div>
				</div>
			<?php endif; ?>
			<?php if ( econsco_opt( 'whatsapp' ) ) : ?>
				<div class="info-card glass">
					<span class="icon-badge"><?php echo econsco_icon( 'whatsapp' ); // phpcs:ignore WordPress.Security.EscapeOutput ?></span>
					<div>
						<h2 class="info-card__title"><?php esc_html_e( 'WhatsApp', 'econsco' ); ?></h2>
						<a href="<?php echo esc_url( 'https://wa.me/' . preg_replace( '/\D/', '', econsco_opt( 'whatsapp' ) ) ); ?>" target="_blank" rel="noopener"><?php esc_html_e( 'Start a chat', 'econsco' ); ?></a>
					</div>
				</div>
			<?php endif; ?>
			<?php if ( econsco_opt( 'address' ) ) : ?>
				<div class="info-card glass">
					<span class="icon-badge"><?php echo econsco_icon( 'pin' ); // phpcs:ignore WordPress.Security.EscapeOutput ?></span>
					<div>
						<h2 class="info-card__title"><?php esc_html_e( 'Office', 'econsco' ); ?></h2>
						<p><?php echo nl2br( esc_html( econsco_opt( 'address' ) ) ); ?></p>
					</div>
				</div>
			<?php endif; ?>
			<?php if ( econsco_opt( 'hours' ) ) : ?>
				<p class="contact__hours"><?php echo esc_html( econsco_opt( 'hours' ) ); ?></p>
			<?php endif; ?>
		</aside>
	</div>
</section>

<?php
econsco_page_editor_content();
get_footer();
