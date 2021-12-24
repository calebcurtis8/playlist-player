module.exports = {
  content: ['./src/**/*.{html,js}', './index.html'],
  theme: {
    extend: {
      colors: {
        gray: 'var(--gray)',
        btn_bg: 'var(--btnBg)',
        text_color: 'var(--text)',
        track_color: 'var(--trackColor)',
        bg_color: 'var(--bgColor)',
        border_color: 'var(--borderColor)',
        progress_color: 'var(--progressColor)'
      }
    }
  },
  corePlugins: {
    preflight: false
  },
  plugins: []
}
