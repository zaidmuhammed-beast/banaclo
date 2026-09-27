<?php
/**
 * Homepage.
 *
 * @package econsco
 */

get_header();
?>

<section class="hero">
	<div class="container hero__grid">
		<div class="hero__copy">
			<p class="eyebrow"><span class="dot"></span><?php esc_html_e( 'Digital growth firm', 'econsco' ); ?></p>
			<h1 class="hero__title"><?php echo esc_html( econsco_opt( 'hero_title' ) ); ?></h1>
			<p class="hero__text"><?php echo esc_html( econsco_opt( 'hero_text' ) ); ?></p>
			<div class="hero__actions">
				<a class="btn btn--primary btn--lg" href="<?php echo esc_url( econsco_page_url( 'contact' ) ); ?>"><?php esc_html_e( 'Get a free proposal', 'econsco' ); ?> <?php echo econsco_icon( 'arrow' ); // phpcs:ignore WordPress.Security.EscapeOutput ?></a>
				<a class="btn btn--glass btn--lg" href="<?php echo esc_url( econsco_page_url( 'services' ) ); ?>"><?php esc_html_e( 'Explore services', 'econsco' ); ?></a>
			</div>
		</div>

		<div class="hero__visual" aria-hidden="true">
			<div class="dash glass glass--strong">
				<div class="dash__head">
					<span><?php esc_html_e( 'Growth overview', 'econsco' ); ?></span>
				</div>
				<svg class="dash__chart" viewBox="0 0 320 140" preserveAspectRatio="none">
					<defs>
						<linearGradient id="ec-area" x1="0" y1="0" x2="0" y2="1">
							<stop offset="0" stop-color="#b6e21d" stop-opacity=".45"/>
							<stop offset="1" stop-color="#b6e21d" stop-opacity="0"/>
						</linearGradient>
					</defs>
					<path d="M0 120 C40 112 60 104 90 96 S140 90 170 70 220 60 250 40 300 22 320 12 V140 H0Z" fill="url(#ec-area)"/>
					<path d="M0 120 C40 112 60 104 90 96 S140 90 170 70 220 60 250 40 300 22 320 12" fill="none" stroke="#b6e21d" stroke-width="3"/>
				</svg>
				<div class="dash__channels">
					<?php foreach ( econsco_services() as $service ) : ?>
						<div class="dash__channel">
							<span class="dash__icon"><?php echo econsco_icon( $service['icon'] ); // phpcs:ignore WordPress.Security.EscapeOutput ?></span>
							<span><?php echo esc_html( $service['title'] ); ?></span>
						</div>
					<?php endforeach; ?>
				</div>
			</div>

			<div class="burst">
				<svg viewBox="0 0 200 120">
					<?php
					$econsco_points = array();
					for ( $i = 0; $i < 48; $i++ ) {
						$angle            = $i * M_PI / 24;
						$radius           = ( 0 === $i % 2 ) ? 1 : 0.84;
						$econsco_points[] = round( 100 + cos( $angle ) * 96 * $radius, 1 ) . ',' . round( 60 + sin( $angle ) * 56 * $radius, 1 );
					}
					?>
					<polygon points="<?php echo esc_attr( implode( ' ', $econsco_points ) ); ?>" fill="#b6e21d"/>
				</svg>
				<span class="burst__text">
					<span class="burst__num">100+</span>
					<span class="burst__label"><?php esc_html_e( 'Satisfied clients', 'econsco' ); ?></span>
				</span>
				<svg class="sparkle sparkle--a" viewBox="0 0 24 24"><path d="M12 0c1 7 5 11 12 12-7 1-11 5-12 12-1-7-5-11-12-12 7-1 11-5 12-12Z"/></svg>
				<svg class="sparkle sparkle--b" viewBox="0 0 24 24"><path d="M12 0c1 7 5 11 12 12-7 1-11 5-12 12-1-7-5-11-12-12 7-1 11-5 12-12Z"/></svg>
			</div>
		</div>
	</div>
</section>

<section class="strip" aria-label="<?php esc_attr_e( 'What we do', 'econsco' ); ?>">
	<div class="strip__track">
		<?php
		$econsco_words = array( __( 'Content Marketing', 'econsco' ), __( 'Google Ads', 'econsco' ), __( 'Meta Ads', 'econsco' ), __( 'Websites', 'econsco' ), __( 'WooCommerce', 'econsco' ), __( 'SEO', 'econsco' ), __( 'Social Media', 'econsco' ), __( 'Branding', 'econsco' ) );
		for ( $pass = 0; $pass < 2; $pass++ ) :
			foreach ( $econsco_words as $word ) :
				?>
				<span<?php echo $pass ? ' aria-hidden="true"' : ''; ?>><?php echo esc_html( $word ); ?></span>
				<?php
			endforeach;
		endfor;
		?>
	</div>
</section>

<section class="section" id="services">
	<div class="container">
		<div class="section-head reveal">
			<p class="eyebrow"><?php esc_html_e( 'What we do', 'econsco' ); ?></p>
			<h2 class="section-title"><?php esc_html_e( 'Three engines of growth, one team.', 'econsco' ); ?></h2>
			<p class="section-lead"><?php esc_html_e( 'Most businesses stall because their content, ads and website work in isolation. We connect them so each one makes the others stronger.', 'econsco' ); ?></p>
		</div>

		<div class="grid grid--3">
			<?php foreach ( econsco_services() as $index => $service ) : ?>
				<article class="service-card glass reveal" style="--delay: <?php echo esc_attr( $index * 80 ); ?>ms">
					<span class="service-card__num">0<?php echo esc_html( $index + 1 ); ?></span>
					<span class="icon-badge"><?php echo econsco_icon( $service['icon'] ); // phpcs:ignore WordPress.Security.EscapeOutput ?></span>
					<h3 class="service-card__title"><?php echo esc_html( $service['title'] ); ?></h3>
					<p><?php echo esc_html( $service['summary'] ); ?></p>
					<ul class="checklist">
						<?php foreach ( $service['points'] as $point ) : ?>
							<li><?php echo econsco_icon( 'check' ); // phpcs:ignore WordPress.Security.EscapeOutput ?><?php echo esc_html( $point ); ?></li>
						<?php endforeach; ?>
					</ul>
					<a class="link-arrow" href="<?php echo esc_url( econsco_page_url( 'services' ) . '#' . $service['id'] ); ?>"><?php esc_html_e( 'Learn more', 'econsco' ); ?> <?php echo econsco_icon( 'arrow' ); // phpcs:ignore WordPress.Security.EscapeOutput ?></a>
				</article>
			<?php endforeach; ?>
		</div>
	</div>
</section>

<section class="section">
	<div class="container">
		<div class="section-head reveal">
			<p class="eyebrow"><?php esc_html_e( 'How we work', 'econsco' ); ?></p>
			<h2 class="section-title"><?php esc_html_e( 'A simple process built around results.', 'econsco' ); ?></h2>
		</div>
		<ol class="grid grid--4 steps">
			<?php foreach ( econsco_process() as $index => $step ) : ?>
				<li class="step glass reveal" style="--delay: <?php echo esc_attr( $index * 80 ); ?>ms">
					<span class="step__num"><?php echo esc_html( $index + 1 ); ?></span>
					<h3 class="step__title"><?php echo esc_html( $step['title'] ); ?></h3>
					<p><?php echo esc_html( $step['text'] ); ?></p>
				</li>
			<?php endforeach; ?>
		</ol>
	</div>
</section>

<section class="section">
	<div class="container split">
		<div class="reveal">
			<p class="eyebrow"><?php esc_html_e( 'Why ECONSCO', 'econsco' ); ?></p>
			<h2 class="section-title"><?php esc_html_e( 'Built for businesses that want to scale.', 'econsco' ); ?></h2>
			<p class="section-lead"><?php esc_html_e( 'We are a modern digital firm: strategists, writers, designers, media buyers and developers under one roof. That means faster work, fewer handovers and one clear owner for your growth.', 'econsco' ); ?></p>
			<a class="btn btn--glass" href="<?php echo esc_url( econsco_page_url( 'about' ) ); ?>"><?php esc_html_e( 'About us', 'econsco' ); ?></a>
		</div>
		<div class="grid grid--2">
			<?php foreach ( econsco_reasons() as $index => $reason ) : ?>
				<div class="feature glass reveal" style="--delay: <?php echo esc_attr( $index * 80 ); ?>ms">
					<h3 class="feature__title"><?php echo esc_html( $reason['title'] ); ?></h3>
					<p><?php echo esc_html( $reason['text'] ); ?></p>
				</div>
			<?php endforeach; ?>
		</div>
	</div>
</section>

<?php
$econsco_recent = new WP_Query(
	array(
		'posts_per_page'      => 3,
		'ignore_sticky_posts' => true,
		'no_found_rows'       => true,
	)
);
if ( $econsco_recent->have_posts() ) :
	?>
	<section class="section">
		<div class="container">
			<div class="section-head section-head--row reveal">
				<div>
					<p class="eyebrow"><?php esc_html_e( 'Insights', 'econsco' ); ?></p>
					<h2 class="section-title"><?php esc_html_e( 'Ideas to help you grow.', 'econsco' ); ?></h2>
				</div>
				<a class="btn btn--glass" href="<?php echo esc_url( econsco_page_url( 'blog' ) ); ?>"><?php esc_html_e( 'All articles', 'econsco' ); ?></a>
			</div>
			<div class="grid grid--3">
				<?php
				while ( $econsco_recent->have_posts() ) {
					$econsco_recent->the_post();
					get_template_part( 'template-parts/card-post' );
				}
				wp_reset_postdata();
				?>
			</div>
		</div>
	</section>
<?php endif; ?>

<?php get_template_part( 'template-parts/cta' ); ?>

<?php
get_footer();
