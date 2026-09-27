<?php
/**
 * Inline SVG icons (24px, stroke-based).
 *
 * @package econsco
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function econsco_icon( $name ) {
	$paths = array(
		'pen'       => '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
		'target'    => '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
		'code'      => '<path d="m16 18 6-6-6-6"/><path d="m8 6-6 6 6 6"/>',
		'search'    => '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
		'spark'     => '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>',
		'chart'     => '<path d="M3 3v18h18"/><path d="m7 15 4-4 3 3 5-6"/>',
		'chat'      => '<path d="M21 12a8 8 0 0 1-11.6 7.1L3 21l1.9-6.4A8 8 0 1 1 21 12Z"/>',
		'arrow'     => '<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>',
		'check'     => '<path d="M20 6 9 17l-5-5"/>',
		'mail'      => '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
		'phone'     => '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2Z"/>',
		'pin'       => '<path d="M12 22s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12Z"/><circle cx="12" cy="10" r="2.5"/>',
		'whatsapp'  => '<path d="M3 21l1.7-5A8.5 8.5 0 1 1 8 19.4Z"/><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.5-2-1-1 1a4 4 0 0 1-2-2l1-1-1-2Z"/>',
		'instagram' => '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".5"/>',
		'linkedin'  => '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 10v7M8 7v.01M12 17v-4a2 2 0 0 1 4 0v4M12 10v7"/>',
		'facebook'  => '<path d="M15 3h-2.5A3.5 3.5 0 0 0 9 6.5V10H6v4h3v7h4v-7h3l1-4h-4V7a1 1 0 0 1 1-1h2Z"/>',
		'menu'      => '<path d="M4 7h16M4 12h16M4 17h16"/>',
		'close'     => '<path d="M6 6l12 12M18 6 6 18"/>',
	);
	if ( ! isset( $paths[ $name ] ) ) {
		return '';
	}
	return '<svg class="icon icon-' . esc_attr( $name ) . '" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' . $paths[ $name ] . '</svg>';
}

/**
 * Flag artwork (3:2) for the locations section.
 */
function econsco_flag( $code ) {
	static $n = 0;
	$n++;
	switch ( $code ) {
		case 'es':
			$body = '<rect width="60" height="40" fill="#c60b1e"/><rect y="10" width="60" height="20" fill="#ffc400"/>'
				// Simplified coat of arms: pillars, crowned quartered shield.
				. '<g stroke="#8a6d0b" stroke-width=".25">'
				. '<rect x="12.2" y="14.5" width="1.8" height="12" fill="#e8e8e8"/><rect x="25" y="14.5" width="1.8" height="12" fill="#e8e8e8"/>'
				. '<rect x="11.6" y="13.4" width="3" height="1.2" fill="#c8a415"/><rect x="24.4" y="13.4" width="3" height="1.2" fill="#c8a415"/>'
				. '<rect x="11.6" y="26.4" width="3" height="1.2" fill="#c8a415"/><rect x="24.4" y="26.4" width="3" height="1.2" fill="#c8a415"/>'
				. '<path d="M11 19.5h4.4v1.4H11zM23.6 19.5H28v1.4h-4.4z" fill="#c60b1e"/>'
				. '<path d="M15.5 12.2l1-2 1.5 1.2 1.5-1.8 1.5 1.8 1.5-1.2 1 2z" fill="#c8a415"/>'
				. '<path d="M15.6 12.8h7.8v1.2h-7.8z" fill="#c8a415"/>'
				. '<path d="M15.6 14.2h7.8v6.8a3.9 3.9 0 0 1-7.8 0Z" fill="#fff"/>'
				. '<path d="M15.6 14.2h3.9v3.6h-3.9Z" fill="#c60b1e"/>'
				. '<path d="M15.6 17.8h3.9v6.9a3.9 3.9 0 0 1-3.9-3.7Z" fill="#ffc400"/>'
				. '<path d="M19.5 17.8h3.9V21a3.9 3.9 0 0 1-3.9 3.9Z" fill="#c60b1e"/>'
				. '</g>'
				. '<path d="M16.4 18.4v5.4M17.4 18.4v6M18.4 18.4v6.2" stroke="#c60b1e" stroke-width=".5"/>'
				. '<path d="M16.5 16.9v-1.6h.6v.5h.5v-.5h.6v.5h.5v-.5h.6v1.6z" fill="#ffc400"/>'
				. '<circle cx="21.45" cy="16" r="1" fill="#c60b1e" opacity=".6"/>';
			break;
		case 'id':
			$body = '<rect width="60" height="40" fill="#fff"/><rect width="60" height="20" fill="#ce1126"/>';
			break;
		case 'gb':
			$clip = 'ec-gb-' . $n;
			$body = '<defs><clipPath id="' . $clip . '"><path d="M30 20h30v20zv20H0zH0V0zV0h30z"/></clipPath></defs>'
				. '<rect width="60" height="40" fill="#012169"/>'
				. '<path d="M0 0l60 40M60 0L0 40" stroke="#fff" stroke-width="8"/>'
				. '<path d="M0 0l60 40M60 0L0 40" stroke="#c8102e" stroke-width="4" clip-path="url(#' . $clip . ')"/>'
				. '<path d="M30 0v40M0 20h60" stroke="#fff" stroke-width="12"/>'
				. '<path d="M30 0v40M0 20h60" stroke="#c8102e" stroke-width="7"/>';
			break;
		default:
			return '';
	}
	return '<svg class="flag" viewBox="0 0 60 40" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">' . $body . '</svg>';
}
