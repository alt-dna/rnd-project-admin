import {PuffLoader} from "react-spinners";

export default function Spinner({fullWidth}) {
    const spinnerStyle = {
        display: 'flex',
        justifyContent: 'center',
        width: fullWidth ? '100%' : 'auto'
    }
    return (
        <div style={spinnerStyle}>
            <PuffLoader color={'#1f3a8a'} speedMultiplier={1}/>
        </div>

    )
}