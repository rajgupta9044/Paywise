import { Link, Typography } from "@mui/material";


export default function Copyright() {

  return (
    <Typography mt="-2" variant="body2" align="center" sx={{ color: 'text.secondary'}}>
            &copy; Raj Gupta<br/>
            <Link variant="subtitle3" component={'a'} href="https://github.com/rajgupta9044" target="_blank">
            GitHub
            </Link>
          </Typography>
  )
}
