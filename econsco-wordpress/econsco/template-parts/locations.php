<?php
/**
 * "Where we operate" section: one glass card per office with its flag and live local time.
 *
 * @package econsco
 */
?>
<section class="section" id="locations">
	<div class="container">
		<div class="section-head reveal">
			<p class="eyebrow"><?php esc_html_e( 'Where we operate', 'econsco' ); ?></p>
			<h2 class="section-title"><?php esc_html_e( 'Three hubs, one team.', 'econsco' ); ?></h2>
			<p class="section-lead"><?php esc_html_e( 'We work from Spain, Indonesia and the United Kingdom — close to clients across Europe and Asia, with someone on the clock across time zones.', 'econsco' ); ?></p>
		</div>
		<div class="grid grid--3">
			<?php foreach ( econsco_locations() as $index => $location ) : ?>
				<article class="location glass reveal" style="--delay: <?php echo esc_attr( $index * 80 ); ?>ms">
					<div class="location__flag"><?php echo econsco_flag( $location['flag'] ); // phpcs:ignore WordPress.Security.EscapeOutput ?></div>
					<div class="location__body">
						<h3 class="location__city"><?php echo esc_html( $location['city'] ); ?></h3>
						<p class="location__country"><?php echo econsco_icon( 'pin' ); // phpcs:ignore WordPress.Security.EscapeOutput ?><?php echo esc_html( $location['country'] ); ?></p>
						<p class="location__time"><span class="location__dot"></span><time data-tz="<?php echo esc_attr( $location['tz'] ); ?>"></time> <span><?php esc_html_e( 'local time', 'econsco' ); ?></span></p>
					</div>
				</article>
			<?php endforeach; ?>
		</div>
	</div>
</section>
