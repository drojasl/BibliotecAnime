<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title>Laravel</title>

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,600&display=swap" rel="stylesheet" />
    </head>
    <body class="antialiased">
        <section>			
			<video id='player' width="800" height="600" autoplay muted>
				<source src="http://127.0.0.1:8000/media/videos/anime/Hanyo no Yashahime - Kesshou.mp4" type="video/mp4">
				Your browser does not support the video tag.
			</video>

			<video id="player2" width="800" height="600" style="display:none;">
			   <source src="" type="video/mp4">
			   Tu navegador no soporta la etiqueta de video.
			</video>
		</section>
        <section>
            <form action="/test2" method="post" enctype="multipart/form-data">
                @csrf
                <label for="file">Seleccionar archivo:</label>
                <input type="file" name="file" id="file" required>
                <button type="submit">Subir Archivo</button>
            </form>
        </section>
    </body>
</html>
