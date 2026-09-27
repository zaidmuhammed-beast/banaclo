<?php
/**
 * About page (slug: about).
 *
 * @package econsco
 */

get_header();
econsco_page_hero(
	__( 'About ECONSCO', 'econsco' ),
	__( 'A modern digital firm built to help businesses scale.', 'econsco' ),
	__( 'We bring content, advertising and web development together under one roof, so growth stops being guesswork.', 'econsco' )
);
?>

<section class="section section--tight">
	<div class="container split">
		<div class="reveal">
			<p class="eyebrow"><?php esc_html_e( 'Our story', 'econsco' ); ?></p>
			<h2 class="section-title"><?php esc_html_e( 'Digital should drive growth, not drain budgets.', 'econsco' ); ?></h2>
		</div>
		<div class="prose reveal">
			<p><?php esc_html_e( 'ECONSCO started with a simple observation: businesses were paying separate agencies for content, ads and websites, and none of them were talking to each other. Budgets leaked, messages clashed and nobody owned the result.', 'econsco' ); ?></p>
			<p><?php esc_html_e( 'So we built a firm that does all three — and connects them. Our strategists, writers, designers, media buyers and developers work as one team around your goals, with shared data and one clear plan.', 'econsco' ); ?></p>
			<p><?php esc_html_e( 'Today we have helped more than 100 clients find new customers, grow revenue and build digital foundations that keep paying off.', 'econsco' ); ?></p>
		</div>
	</div>
</section>

<section class="section">
	<div class="container">
		<div class="stats glass glass--strong reveal">
			<div class="stat">
				<span class="stat__num">100+</span>
				<span class="stat__label"><?php esc_html_e( 'Satisfied clients', 'econsco' ); ?></span>
			</div>
			<div class="stat">
				<span class="stat__num">3</span>
				<span class="stat__label"><?php esc_html_e( 'Core services, one team', 'econsco' ); ?></span>
			</div>
			<div class="stat">
				<span class="stat__num">1</span>
				<span class="stat__label"><?php esc_html_e( 'Clear growth plan', 'econsco' ); ?></span>
			</div>
		</div>
	</div>
</section>

<section class="section">
	<div class="container">
		<div class="section-head reveal">
			<p class="eyebrow"><?php esc_html_e( 'What we value', 'econsco' ); ?></p>
			<h2 class="section-title"><?php esc_html_e( 'How we work with every client.', 'econsco' ); ?></h2>
		</div>
		<div class="grid grid--4">
			<?php foreach ( econsco_values() as $index => $value ) : ?>
				<div class="feature glass reveal" style="--delay: <?php echo esc_attr( $index * 80 ); ?>ms">
					<h3 class="feature__title"><?php echo esc_html( $value['title'] ); ?></h3>
					<p><?php echo esc_html( $value['text'] ); ?></p>
				</div>
			<?php endforeach; ?>
		</div>
	</div>
</section>

<?php
get_template_part( 'template-parts/locations' );
econsco_page_editor_content();
get_template_part( 'template-parts/cta' );
get_footer();
