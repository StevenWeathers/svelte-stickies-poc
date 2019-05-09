<script>
    import html2pdf from 'html2pdf.js'

    export let filename = 'sticky-notes.pdf'

	const generatePDF = () => {
        const element = document.getElementById('StickyNotesApp')
        const opt = {
            margin: 1,
            filename,
            image: {
                type: 'jpeg',
                quality: 0.98
            },
            html2canvas: {
                scale: 1
            },
            jsPDF: {
                unit: 'mm',
                orientation: 'landscape',
                format: [element.clientHeight, element.clientWidth]
            },
            pagebreak: 'avoid-all'
        }

        html2pdf().set(opt).from(element).save();
	}
</script>

<nav class="flex items-center justify-between bg-teal p-6">
    <div class="flex items-center flex-no-shrink text-white mr-6">
        <span class="font-semibold text-xl tracking-tight">Sticky Note POC</span>
    </div>
    <button on:click={generatePDF} class="inline-block text-sm px-4 py-2 leading-none border rounded text-white border-white hover:border-transparent hover:text-teal hover:bg-white mt-4 lg:mt-0">Download PDF</button>
</nav>