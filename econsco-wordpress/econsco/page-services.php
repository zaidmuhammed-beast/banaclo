<?php
/**
 * Services page (slug: services).
 *
 * @package econsco
 */

get_header();
econsco_page_hero(
	__( 'Services', 'econsco' ),
	__( 'Everything you need to grow online.', 'econsco' ),
	__( 'Content that attracts, advertising that converts and websites that sell — as individual services or one joined-up growth plan.', 'econsco' )
);
?>

<section class="section section--tight">
	<div class="container service-list">
		<?php foreach ( econsco_services() as $index => $service ) : ?>
			<article class="service-row glass reveal" id="<?php echo esc_attr( $service['id'] ); ?>">
				<div class="service-row__intro">
					<span class="service-card__num">0<?php echo esc_html( $index + 1 ); ?></span>
					<span class="icon-badge icon-badge--lg"><?php echo econsco_icon( $service['icon'] ); // phpcs:ignore WordPress.Security.EscapeOutput ?></span>
					<h2 class="service-row__title"><?php echo esc_html( $service['title'] ); ?></h2>
					<p class="section-lead"><?php echo esc_html( $service['summary'] ); ?></p>
				</div>
				<div class="service-row__detail">
					<h3 class="service-row__label"><?php esc_html_e( 'What is included', 'econsco' ); ?></h3>
					<ul class="checklist checklist--lg">
						<?php foreach ( $service['points'] as $point ) : ?>
							<li><?php echo econsco_icon( 'check' ); // phpcs:ignore WordPress.Security.EscapeOutput ?><?php echo esc_html( $point ); ?></li>
						<?php endforeach; ?>
					</ul>
					<a class="btn btn--primary" href="<?php echo esc_url( econsco_page_url( 'contact' ) ); ?>"><?php esc_html_e( 'Discuss this service', 'econsco' ); ?> <?php echo econsco_icon( 'arrow' ); // phpcs:ignore WordPress.Security.EscapeOutput ?></a>
				</div>
			</article>
		<?php endforeach; ?>
	</div>
</section>

<section class="section">
	<div class="container">
		<div class="section-head reveal">
			<p class="eyebrow"><?php esc_html_e( 'Also available', 'econsco' ); ?></p>
			<h2 class="section-title"><?php esc_html_e( 'Supporting services.', 'econsco' ); ?></h2>
		</div>
		<div class="grid grid--4">
			<?php foreach ( econsco_supporting_services() as $index => $item ) : ?>
				<div class="feature glass reveal" style="--delay: <?php echo esc_attr( $index * 80 ); ?>ms">
					<span class="icon-badge"><?php echo econsco_icon( $item['icon'] ); // phpcs:ignore WordPress.Security.EscapeOutput ?></span>
					<h3 class="feature__title"><?php echo esc_html( $item['title'] ); ?></h3>
					<p><?php echo esc_html( $item['text'] ); ?></p>
				</div>
			<?php endforeach; ?>
		</div>
	</div>
</section>

<?php
econsco_page_editor_content();
get_template_part( 'template-parts/cta' );
get_footer();
