export default function ApplicationLogo(props) {
    const { className } = props;
    
    return (
        <span className="text-4xl font-bold text-gray-200">
            <img className={`${className} w-16`} src="/images/transtrack-logo.png" alt="TransTrack" />
        </span>
    );
}
