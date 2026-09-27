<?php
/**
 * Call-to-action band shown near the bottom of most pages.
 *
 * @package econsco
 */
?>
<section class="section">
	<div class="container">
		<div class="cta glass glass--strong reveal">
			<div>
				<h2 class="cta__title"><?php echo esc_html( econsco_opt( 'cta_title' ) ); ?></h2>
				<p class="cta__text"><?php echo esc_html( econsco_opt( 'cta_text' ) ); ?></p>
			</div>
			<a class="btn btn--primary btn--lg" href="<?php echo esc_url( econsco_page_url( 'contact' ) ); ?>"><?php esc_html_e( 'Start a project', 'econsco' ); ?> <?php echo econsco_icon( 'arrow' ); // phpcs:ignore WordPress.Security.EscapeOutput ?></a>
		</div>
	</div>
</section>
