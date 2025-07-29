module.exports = {
  webpack(config) {
    config.module.rules.push({
      test: /\.(glb|gltf)$/,
      use: {
        loader: 'file-loader',
        options: {
          publicPath: '/_next/static/models',
          outputPath: 'static/models',
          name: '[name].[hash:7].[ext]',
        },
      },
    });

    return config;
  },
};
