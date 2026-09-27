<?php
/**
 * Post card used in the blog, archives and homepage.
 *
 * @package econsco
 */
?>
<article <?php post_class( 'post-card glass reveal' ); ?>>
	<?php if ( has_post_thumbnail() ) : ?>
		<a class="post-card__media" href="<?php the_permalink(); ?>" tabindex="-1" aria-hidden="true"><?php the_post_thumbnail( 'medium_large' ); ?></a>
	<?php endif; ?>
	<div class="post-card__body">
		<p class="post-card__meta"><?php echo esc_html( get_the_date() ); ?></p>
		<h3 class="post-card__title"><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h3>
		<p class="post-card__excerpt"><?php echo esc_html( wp_strip_all_tags( get_the_excerpt() ) ); ?></p>
		<a class="link-arrow" href="<?php the_permalink(); ?>"><?php esc_html_e( 'Read more', 'econsco' ); ?> <?php echo econsco_icon( 'arrow' ); // phpcs:ignore WordPress.Security.EscapeOutput ?><span class="screen-reader-text"> <?php the_title(); ?></span></a>
	</div>
</article>
