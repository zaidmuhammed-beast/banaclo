<?php
/**
 * Site footer.
 *
 * @package econsco
 */

$econsco_socials = array_filter(
	array(
		'instagram' => econsco_opt( 'instagram' ),
		'linkedin'  => econsco_opt( 'linkedin' ),
		'facebook'  => econsco_opt( 'facebook' ),
	)
);
?>
</main>

<footer class="site-footer">
	<div class="container">
		<div class="site-footer__grid glass">
			<div class="site-footer__about">
				<?php get_template_part( 'template-parts/logo' ); ?>
				<p><?php echo esc_html( econsco_opt( 'footer_about' ) ); ?></p>
				<?php if ( $econsco_socials ) : ?>
					<ul class="socials">
						<?php foreach ( $econsco_socials as $network => $url ) : ?>
							<li><a href="<?php echo esc_url( $url ); ?>" target="_blank" rel="noopener" aria-label="<?php echo esc_attr( ucfirst( $network ) ); ?>"><?php echo econsco_icon( $network ); // phpcs:ignore WordPress.Security.EscapeOutput ?></a></li>
						<?php endforeach; ?>
					</ul>
				<?php endif; ?>
			</div>

			<div>
				<h2 class="site-footer__heading"><?php esc_html_e( 'Services', 'econsco' ); ?></h2>
				<ul class="site-footer__links">
					<?php foreach ( econsco_services() as $service ) : ?>
						<li><a href="<?php echo esc_url( econsco_page_url( 'services' ) . '#' . $service['id'] ); ?>"><?php echo esc_html( $service['title'] ); ?></a></li>
					<?php endforeach; ?>
				</ul>
			</div>

			<div>
				<h2 class="site-footer__heading"><?php esc_html_e( 'Company', 'econsco' ); ?></h2>
				<?php
				wp_nav_menu(
					array(
						'theme_location' => 'footer',
						'container'      => false,
						'menu_class'     => 'site-footer__links',
						'depth'          => 1,
						'fallback_cb'    => 'econsco_nav_fallback',
					)
				);
				?>
			</div>

			<div>
				<h2 class="site-footer__heading"><?php esc_html_e( 'Get in touch', 'econsco' ); ?></h2>
				<ul class="site-footer__links site-footer__contact">
					<li><?php echo econsco_icon( 'mail' ); // phpcs:ignore WordPress.Security.EscapeOutput ?><a href="mailto:<?php echo esc_attr( antispambot( econsco_opt( 'email' ) ) ); ?>"><?php echo esc_html( antispambot( econsco_opt( 'email' ) ) ); ?></a></li>
					<?php if ( econsco_opt( 'phone' ) ) : ?>
						<li><?php echo econsco_icon( 'phone' ); // phpcs:ignore WordPress.Security.EscapeOutput ?><a href="tel:<?php echo esc_attr( preg_replace( '/[^0-9+]/', '', econsco_opt( 'phone' ) ) ); ?>"><?php echo esc_html( econsco_opt( 'phone' ) ); ?></a></li>
					<?php endif; ?>
					<?php if ( econsco_opt( 'address' ) ) : ?>
						<li><?php echo econsco_icon( 'pin' ); // phpcs:ignore WordPress.Security.EscapeOutput ?><span><?php echo nl2br( esc_html( econsco_opt( 'address' ) ) ); ?></span></li>
					<?php endif; ?>
				</ul>
			</div>
		</div>

		<div class="site-footer__bottom">
			<p>&copy; <?php echo esc_html( gmdate( 'Y' ) ); ?> <?php bloginfo( 'name' ); ?>. <?php esc_html_e( 'All rights reserved.', 'econsco' ); ?></p>
			<a href="#top"><?php esc_html_e( 'Back to top', 'econsco' ); ?> &uarr;</a>
		</div>
	</div>
</footer>

<?php if ( econsco_opt( 'whatsapp' ) ) : ?>
	<a class="whatsapp-float" href="<?php echo esc_url( 'https://wa.me/' . preg_replace( '/\D/', '', econsco_opt( 'whatsapp' ) ) ); ?>" target="_blank" rel="noopener" aria-label="<?php esc_attr_e( 'Chat on WhatsApp', 'econsco' ); ?>"><?php echo econsco_icon( 'whatsapp' ); // phpcs:ignore WordPress.Security.EscapeOutput ?></a>
<?php endif; ?>

<?php wp_footer(); ?>
</body>
</html>
